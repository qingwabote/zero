#include "Semaphore.hpp"

namespace logan
{
    void Semaphore::signal()
    {
        std::unique_lock<std::mutex> lock(_mutex);
        _count++;
        _cv.notify_one();
    }

    void Semaphore::wait()
    {
        std::unique_lock<std::mutex> lock(_mutex);
        while (!_count)
        {
            _cv.wait(lock);
        }
        _count--;
    }
}