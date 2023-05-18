#include <iostream>
#include "helper_ts.h"
#include <fstream>
#include <vector>
using namespace std;

int main()
{
    std::ifstream f("flexbuffer_test2.bin",std::ios::binary | std::ios::in);
    // if(!f.is_open())
    // {
    //     cout << "kurwa" << endl;    
    // }

    std::vector<uint8_t> raw((std::istreambuf_iterator<char>(f)),
                             std::istreambuf_iterator<char>());


    cout << help(raw.data(), raw.size()) << endl;
//    cout << "Hello World!" << endl;
    return 0;
}
