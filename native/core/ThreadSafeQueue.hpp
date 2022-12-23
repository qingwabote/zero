#pragma once

#include <mutex>
#include <vector>
#include <functional>

template <class T>
class ThreadSafeQueue
{
private:
    std::mutex _mutex;
    std::condition_variable _cv;
    std::vector<T> _queue;

public:
    void push(T &&val)
    {
        std::unique_lock<std::mutex> lock(_mutex);
        _queue.push_back(std::forward<T>(val));
        _cv.notify_one();
    }

    void unblock()
    {
        std::unique_lock<std::mutex> lock(_mutex);
        _cv.notify_all();
    }

    std::vector<T> flush(bool blocked = false)
    {
        std::unique_lock<std::mutex> lock(_mutex);
        if (_queue.size() == 0 && blocked)
        {
            _cv.wait(lock);
        }
        auto copy = std::move(_queue); // https://stackoverflow.com/questions/9168823/reusing-a-moved-container
        _queue.clear();
        return copy;
    }
};