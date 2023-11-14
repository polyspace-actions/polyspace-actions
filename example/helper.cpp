// Copyright 2023 The MathWorks, Inc.

#include "helper.hpp"

int helper::function()
{
#ifdef triggerError
 int val;
#else
 int val = 1;
 
#endif
 return val +3;
}
