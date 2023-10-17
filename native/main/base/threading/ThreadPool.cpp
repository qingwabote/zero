#include "ThreadPool.hpp"

ThreadPool &ThreadPool::shared()
{
    static ThreadPool shared{3};
    return shared;
}

ThreadPool::ThreadPool(uint32_t size)
{
    _threads.resize(size);
}

void ThreadPool::post(std::unique_ptr<callable::Callable<void>> &&callable)
{
    _functionQueue.push(std::forward<std::unique_ptr<callable::Callable<void>>>(callable));

    if (!_threadsCreated)
    {
        for (size_t i = 0; i < _threads.size(); i++)
        {
            _threads[i] = std::make_unique<std::thread>(
                [this]()
                {
                    while (_running)
                    {
                        // auto functionQueue = _functionQueue.flush(true);
                        // for (auto &func : functionQueue)
                        // {
                        //     func();
                        // }
                        std::unique_ptr<callable::Callable<void>> f{};
                        _functionQueue.pop(f, true);
                        f->call();
                    }
                });
        }
        _threadsCreated = true;
    }
}

void ThreadPool::join()
{
    _running = false;
    for (size_t i = 0; i < _threads.size(); i++)
    {
        auto nudge = new auto(
            [=]()
            {
                // do nothing
            });
        post(nudge); // wake the blocked threads up
    }
    for (size_t i = 0; i < _threads.size(); i++)
    {
        _threads[i]->join();
    }
}

ThreadPool::~ThreadPool()
{
    if (_running)
    {
        join();
    }
}
