#include <node.h>
#include <node_buffer.h>
#include "helper_ts.h"

#include "json2/boost/json/src.hpp"
#define FLATBUFFERS_LOCALE_INDEPENDENT 0
#include "flatbuffers/flexbuffers.h"


using v8::FunctionCallbackInfo;
using v8::Isolate;
using v8::Local;
using v8::Object;
using v8::Number;
using v8::String;
using v8::Value;
using v8::Context;


void Method(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();
  Local<Context> context = isolate->GetCurrentContext();

  Local<v8::Object> bufferObj = args[0]->ToObject(context).ToLocalChecked();
  unsigned char* bufferData = (unsigned char*)node::Buffer::Data(bufferObj);
  int bufferSize = node::Buffer::Length(bufferObj);

  // std::string result = help(bufferData, bufferSize);
  // std::string result = "result";

  // **************************************
    auto flex = flexbuffers::GetRoot(bufferData,bufferSize);
    auto vec = flex.AsVector();
    auto sz = vec.size();
    if(sz<2 || sz % 2 != 0)
        return {};
    boost::json::array ar;

    for(int i = 0; i < sz; ++i)
    {
        auto handle = vec[i].AsUInt8();
        ++i;
        const auto &flex_value = vec[i];
        ar.push_back(handle);

        auto value = flex_value.IsFloat() ? flex_value.AsDouble() :
                         flex_value.IsInt() ? flex_value.AsInt64() :
                         flex_value.IsUInt() ? flex_value.AsUInt64() :
                         flex_value.IsBool() ? flex_value.AsBool() : throw std::runtime_error("undefine type");
        ar.push_back(value);

    }

    std::string result = boost::json::serialize(ar);
  // **************************************

  args.GetReturnValue().Set(String::NewFromUtf8(isolate, result.c_str()).ToLocalChecked());
}


void Initialize(Local<Object> exports) {
  NODE_SET_METHOD(exports, "flexbufferParser", Method);
}


NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize)