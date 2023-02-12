#pragma once

#include <mutex>
#include <queue>
#include <functional>

template <class T>
class ThreadSafeQueue
{
private:
    std::mutex _mutex;
    std::condition_variable _cv;
    std::queue<T> _queue;

public:
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
        // if (_queue.empty())
        // {
        //     if (!blocked)
        //     {
        //         return false;
        //     }
        //     _cv.wait(lock);
        // }

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

    // std::vector<T> flush(bool blocked = false)
    // {
    //     std::unique_lock<std::mutex> lock(_mutex);
    //     if (_queue.size() == 0 && blocked)
    //     {
    //         _cv.wait(lock);
    //     }
    //     auto copy = std::move(_queue); // https://stackoverflow.com/questions/9168823/reusing-a-moved-container
    //     _queue.clear();
    //     return copy;
    // }

    // void unblock()
    // {
    //     // std::unique_lock<std::mutex> lock(_mutex);
    //     _cv.notify_all();
    // }
};