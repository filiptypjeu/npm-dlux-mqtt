import { ColorType, DluxLedStatus, SceneType, status } from "dlux";
import { MqttClient } from "mqtt";

export interface IDluxSubscription {
  topic: string;
  callback: (paylaod: Buffer) => void;
}

export class DluxMqttDevice {
  protected m_status: string = "offline";
  protected m_client: MqttClient | undefined;
  protected m_inputs: string = ":::::::";
  protected m_outputs: string = "--------";

  constructor(public readonly name: string, public readonly topic: string, client?: MqttClient) {
    if (client) this.initialize(client);
  }

  public get online(): boolean {
    return this.m_status === "online";
  }
  public get statusTopic(): string {
    return this.topic + "/status";
  }
  public get outputsTopic(): string {
    return this.topic + "/outputs";
  }
  public get inputsTopic(): string {
    return this.topic + "/inputs";
  }

  protected get commonSubscriptions(): IDluxSubscription[] {
    return [
      {
        topic: this.statusTopic,
        callback: msg => (this.m_status = msg.toString()),
      },
      {
        topic: this.inputsTopic,
        callback: msg => (this.m_inputs = msg.toString()),
      },
      {
        topic: this.outputsTopic,
        callback: msg => (this.m_outputs = msg.toString()),
      },
    ];
  }

  protected get deviceSubscriptions(): IDluxSubscription[] {
    return [];
  }

  public get client(): MqttClient {
    if (!this.m_client) {
      throw new Error(`DluxMqttLedDevice "${this.name}" does not have an MQTT client"`);
    }
    return this.m_client;
  }

  public set client(client: MqttClient) {
    this.m_client = client;
  }

  public get subscriptions(): IDluxSubscription[] {
    return this.commonSubscriptions.concat(this.deviceSubscriptions);
  }

  public addListeners(): void {
    this.subscriptions.forEach(s =>
      this.client.addListener("message", (t: string, p: Buffer) => {
        if (t === s.topic) s.callback(p);
      })
    );
  }

  public subscribe(): void {
    this.subscriptions.forEach(s => this.client.subscribe(s.topic));
  }

  public requestStates(): void {
    this.client.publish(this.topic, "s");
    this.client.publish(this.topic, "g");
  }

  public initialize(client: MqttClient): void {
    this.client = client;
    this.addListeners();
    this.subscribe();
    this.requestStates();
  }

  private stringToBool(str: string): boolean | undefined {
    return str === "1" ? true : str === "0" ? false : undefined;
  }

  private stringToValue(str: string): number | boolean | undefined {
    return str.length === 3 ? Number(str) : this.stringToBool(str);
  }

  public get inputs(): (number | boolean | undefined)[] {
    return this.m_inputs.split(":").map(str => this.stringToValue(str));
  }

  public get outputs(): (boolean | undefined)[] {
    return this.m_outputs.split("").map(str => this.stringToBool(str));
  }
}

export class DluxMqttLedDevice extends DluxMqttDevice {
  private m_state: DluxLedStatus = {
    scene: SceneType.ERROR,
    colorType: ColorType.ERROR,
    bufferSize: 0,
    sceneOn: false,
    sceneUpdating: false,
  };

  constructor(name: string, topic: string, client?: MqttClient) {
    super(name, topic, client);
  }

  public get stateTopic(): string {
    return this.topic + "/states";
  }
  public get actionTopic(): string {
    return this.topic + "/a";
  }
  public get sceneTopic(): string {
    return this.topic + "/s";
  }

  public get state(): DluxLedStatus {
    return this.m_state;
  }

  protected override get deviceSubscriptions(): IDluxSubscription[] {
    return [
      {
        topic: this.stateTopic,
        callback: msg => (this.m_state = status(msg.toString())),
      },
    ];
  }
}
