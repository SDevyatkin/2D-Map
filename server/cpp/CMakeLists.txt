project (Map2D)

add_subdirectory(flatbuffers-master)

include_directories(${CMAKE_SOURCE_DIR}/flatbuffers/include)

add_executable(Map2D main.cpp)

target_link_libraries(Map2D PRIVATE flatbuffers)