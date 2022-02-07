import { ColorType, SceneType } from "dlux";
import { DluxMqttLedDevice } from "../index";

const d = new DluxMqttLedDevice("led", "dlux/l2");

test("dlux mqtt led device basic properties", () => {
  expect(d.name).toEqual("led");
  expect(d.topic).toEqual("dlux/l2");
  expect(d.statesTopic).toEqual("dlux/l2/states");
  expect(d.actionTopic).toEqual("dlux/l2/a");
  expect(d.sceneTopic).toEqual("dlux/l2/s");
});

const subs = d.subscriptions;

test("dlux mqtt led device subscriptions", () => {
  expect(subs).toHaveLength(6);
  expect(subs[5].topic).toEqual("dlux/l2/states");
});

test("dlux mqtt led device default state", () => {
  expect(d.state).toEqual({
    scene: SceneType.ERROR,
    colorType: ColorType.ERROR,
    bufferSize: 0,
    sceneOn: false,
    sceneUpdating: false,
  });
});

test("dlux mqtt led device state callback", () => {
  subs[5].callback(Buffer.from("2:4:999:0:1:1:1:255,254,253,252"));
  expect(d.state).toEqual({
    scene: SceneType.PATTERN,
    colorType: ColorType.RGBW,
    bufferSize: 999,
    powerOn: false,
    dataOn: true,
    sceneOn: true,
    sceneUpdating: true,
    color: [255, 254, 253, 252],
  });
});
