import { test } from "node:test";
import assert from "node:assert/strict";
import { mediaStorageErrorMessage } from "../../src/lib/media-storage-error";

test("storage failures explain R2 permissions without exposing provider messages", () => {
  const message=mediaStorageErrorMessage({name:"AccessDenied",message:"private provider details"});
  assert.match(message!,/Object Read & Write/);
  assert.ok(!message!.includes("private"));
  assert.match(mediaStorageErrorMessage({cause:{Code:"SignatureDoesNotMatch"}})!,/Credențialele/);
  assert.match(mediaStorageErrorMessage({code:"NoSuchBucket"})!,/Bucketul/);
  assert.equal(mediaStorageErrorMessage(new Error("unknown internal error")),undefined);
  assert.equal(mediaStorageErrorMessage({name:"Forbidden"}),undefined);
  const cyclic: {cause?:unknown}={};cyclic.cause=cyclic;
  assert.equal(mediaStorageErrorMessage(cyclic),undefined);
});
