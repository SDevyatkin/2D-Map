cmake_minimum_required(VERSION 3.5)

project(helper_ts LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_FLAGS "-static-libgcc -static-libstdc++ -static")


add_library(helper_ts helper_ts.h helper_ts.cpp)
#add_library(helper_ts_dynamic SHARED helper_ts.h helper_ts.cpp)

add_executable(helper_ts_test main.cpp)

add_compile_definitions(NAPI_VERSION=8)
add_subdirectory(node_modules/node-addon-api)


target_include_directories(helper_ts PUBLIC ${PROJECT_SOURCE_DIR}/json2)
target_include_directories(helper_ts PUBLIC ${PROJECT_SOURCE_DIR})

target_link_libraries(helper_ts_test PUBLIC helper_ts)
target_link_libraries(${PROJECT_NAME} ${CMAKE_JS_LIB} node-addon-api)

#target_include_directories(helper_ts_dynamic PUBLIC ${PROJECT_SOURCE_DIR}/json2)
#target_include_directories(helper_ts_dynamic PUBLIC ${PROJECT_SOURCE_DIR})
