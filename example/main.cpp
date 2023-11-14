// Copyright 2023 The MathWorks, Inc.
#include "assert.h"
#include <cstdlib>

#include "helper.hpp"

char * getBuff()
{
    //There is some new development going on here
    return new char;
}
int fun(int seed)
{
    int val = 0;
    return val * seed + 1; // polyspace Defect:NON_INIT_VAR "test"
}

int main()
{
    auto ptr = getBuff();
    delete ptr;
    int seed = helper::function();

    if(seed = 1) //Or not
    {
        int num = fun(seed);
        return 3/num;
    }
    else
    {
        return fun(0);
    }
 }

int function2()
{
    float val;
    return (int)val+1;
}
