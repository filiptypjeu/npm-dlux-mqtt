import { DluxMqttDevice } from "../index";

const d = new DluxMqttDevice("device", "dlux/l1");

test("dlux mqtt device basic properties", () => {
  expect(d.name).toEqual("device");
  expect(d.topic).toEqual("dlux/l1");
  expect(d.statusTopic).toEqual("dlux/l1/status");
  expect(d.inputsTopic).toEqual("dlux/l1/inputs");
  expect(d.outputsTopic).toEqual("dlux/l1/outputs");
});

const subs = d.subscriptions;

test("dlux mqtt device subscriptions", () => {
  expect(subs).toHaveLength(3);
});

test("dlux mqtt device subscription topics", () => {
  expect(subs[0].topic).toEqual("dlux/l1/status");
  expect(subs[1].topic).toEqual("dlux/l1/inputs");
  expect(subs[2].topic).toEqual("dlux/l1/outputs");
});

test("dlux mqtt device status callback", () => {
  expect(d.online).toEqual(false);
  subs[0].callback(Buffer.from("online"));
  expect(d.online).toEqual(true);
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
  subs[1].callback(Buffer.from(":-:asd:042:42:1:999:0:1"));
  const inputs = d.inputs;

  expect(inputs).toHaveLength(9);
  expect(inputs).toEqual([undefined, undefined, NaN, 42, undefined, true, 999, false, true]);
});

test("dlux mqtt device set outputs with callback", () => {
  subs[2].callback(Buffer.from("-a011-?01"));
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
