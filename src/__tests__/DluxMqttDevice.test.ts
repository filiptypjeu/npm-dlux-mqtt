import { DluxMqttDevice } from "../index";

const d = new DluxMqttDevice("device", "dlux/l1");

test("dlux mqtt device basic properties", () => {
  expect(d.name).toEqual("device");
  expect(d.topic).toEqual("dlux/l1");
  expect(d.statusTopic).toEqual("dlux/l1/status");
  expect(d.versionTopic).toEqual("dlux/l1/version");
  expect(d.logTopic).toEqual("dlux/l1/log");
  expect(d.inputsTopic).toEqual("dlux/l1/inputs");
  expect(d.outputsTopic).toEqual("dlux/l1/outputs");
});

const subs = d.subscriptions;

test("dlux mqtt device subscriptions", () => {
  expect(subs).toHaveLength(5);
});

test("dlux mqtt device subscription topics", () => {
  expect(subs[0].topic).toEqual("dlux/l1/status");
  expect(subs[1].topic).toEqual("dlux/l1/version");
  expect(subs[2].topic).toEqual("dlux/l1/log");
  expect(subs[3].topic).toEqual("dlux/l1/inputs");
  expect(subs[4].topic).toEqual("dlux/l1/outputs");
});

test("dlux mqtt device status callback", () => {
  expect(d.online).toEqual(false);
  subs[0].callback(Buffer.from("online"));
  expect(d.online).toEqual(true);
});

test("dlux mqtt device version callback", () => {
  expect(d.version).toEqual("");
  subs[1].callback(Buffer.from("v.1.0"));
  expect(d.version).toEqual("v.1.0");
  subs[2].callback(Buffer.from("Version = v.4.2"));
  expect(d.version).toEqual("v.4.2");
});

test("dlux mqtt device default inputs", () => {
  const inputs = d.inputs;
  expect(inputs).toHaveLength(8);
  expect(inputs).toEqual([undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined]);
});

test("dlux mqtt device default outputs", () => {
  const outputs = d.outputs;
  expect(outputs).toHaveLength(8);
  expect(outputs).toEqual([undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined]);
});

test("dlux mqtt device set inputs with callback", () => {
  subs[3].callback(Buffer.from(":-:asd:042:42:1:999:0:1"));
  const inputs = d.inputs;

  expect(inputs).toHaveLength(9);
  expect(inputs).toEqual([undefined, undefined, NaN, 42, undefined, true, 999, false, true]);
});

test("dlux mqtt device set outputs with callback", () => {
  subs[4].callback(Buffer.from("-a011-?01"));
  const outputs = d.outputs;

  expect(outputs).toHaveLength(9);
  expect(outputs).toEqual([undefined, undefined, false, true, true, undefined, undefined, false, true]);
});

test("dlux mqtt device throw when no client", () => {
  expect(() => d.client).toThrow();
  expect(() => d.subscribe()).toThrow();
  expect(() => d.requestStates()).toThrow();
  expect(() => d.addListeners()).toThrow();
});
