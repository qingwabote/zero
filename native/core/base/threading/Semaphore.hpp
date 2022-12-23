#pragma once

#include <mutex>

namespace logan
{
    class Semaphore
    {
    private:
        int32_t _count{0};
        std::mutex _mutex;
        std::condition_variable _cv;

    public:
        void signal();
        void wait();
    };
}
