#pragma once

#include <mutex>
#include <queue>

template <class T>
class ThreadSafeQueue
{
private:
    std::mutex _mutex;
    std::condition_variable _cv;
    std::queue<T> _queue;

public:
    uint32_t size() { return _queue.size(); }

    void push(T &&val)
    {
        {
            std::unique_lock<std::mutex> lock(_mutex);
            _queue.emplace(std::forward<T>(val));
        }
        _cv.notify_one();
    }

    bool pop(T &val, bool blocked = false)
    {
        std::unique_lock<std::mutex> lock(_mutex);

        while (_queue.empty())
        {
            if (!blocked)
            {
                return false;
            }
            _cv.wait(lock);
        }

        val = std::move(_queue.front());
        _queue.pop();
        return true;
    }
};