#pragma once

#include <mutex>
#include <vector>
#include <functional>

template <class T>
class ThreadSafeQueue
{
private:
    std::mutex _mutex;
    std::condition_variable _sleepCondition;
    std::vector<T> _queue;

public:
    void push(T &&val)
    {
        _mutex.lock();
        _queue.push_back(std::forward<T>(val));
        _mutex.unlock();
        _sleepCondition.notify_one();
    }

    std::vector<T> flush(bool blocked = false)
    {
        std::unique_lock<std::mutex> lock(_mutex);
        if (_queue.size() == 0 && blocked)
        {
            _sleepCondition.wait(lock);
        }
        auto copy = std::move(_queue); // https://stackoverflow.com/questions/9168823/reusing-a-moved-container
        _queue.clear();
        return copy;
    }
};