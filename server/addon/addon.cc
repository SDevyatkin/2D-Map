#include <node_api.h>
#include "flatbuffers/flatbuffers.h"

napi_value MyFunction(napi_env env, napi_callback_info info) {
  flatbuffers::FlatBufferBuilder builder;
  // Use Flatbuffers...
  return nullptr;
}

napi_value Init(napi_env env, napi_value exports) {
  napi_status status;
  napi_value fn;

  status = napi_create_function(env, nullptr, 0, MyFunction, nullptr, &fn);
  if (status != napi_ok) return nullptr;

  status = napi_set_named_property(env, exports, "my_function", fn);
  if (status != napi_ok) return nullptr;

  return exports;
}

NAPI_MODULE(addon, Init)