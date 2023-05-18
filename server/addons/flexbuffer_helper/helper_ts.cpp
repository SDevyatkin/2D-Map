#include "helper_ts.h"
#include <iostream>
#include "json2/boost/json/src.hpp"
#define FLATBUFFERS_LOCALE_INDEPENDENT 0
#include "flatbuffers/flexbuffers.h"
std::string help(unsigned char *buffer, std::size_t size)
{
    std::cout << size << std::endl;
    auto flex = flexbuffers::GetRoot(buffer,size);
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

    return boost::json::serialize(ar);
}
