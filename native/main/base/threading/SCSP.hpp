#pragma once

#include <atomic>
#include <vector>
#include "log.h"

/* A lock-free queue for a single-consumer, single-producer. https://github.com/cameron314/readerwriterqueue */
template <class T>
class SCSP
{
private:
    struct Block
    {
        std::atomic<uint32_t> head = 0;
        std::atomic<uint32_t> tail = 0;
        std::vector<T> data;
        std::atomic<Block *> next;

        Block(size_t size, Block *next) : data(size + 1), next(next) {}
    };

    size_t _blockSize;

    std::atomic<Block *> _head = nullptr;
    std::atomic<Block *> _tail = nullptr;

public:
    explicit SCSP(size_t blockSize) : _blockSize(blockSize)
    {
        Block *block = new Block(_blockSize, nullptr);
        block->next = block;

        _head.store(block, std::memory_order_relaxed);
        _tail.store(block, std::memory_order_relaxed);

        // Block *block = new Block(_blockSize, nullptr);
        // Block *head = block;
        // for (size_t i = 0; i < 300; i++)
        // {
        //     Block *b = new Block(_blockSize, nullptr);
        //     block->next = b;

        //     block = b;
        // }
        // block->next = head;

        // _head.store(head, std::memory_order_relaxed);
        // _tail.store(head, std::memory_order_relaxed);
    }

    void push(T &&val)
    {
        Block *block = _tail.load(std::memory_order_relaxed);
        uint32_t tail = block->tail.load(std::memory_order_relaxed);

        Block *const tailBlock = block;
        if ((tail + 1) % block->data.size() == block->head.load(std::memory_order_acquire))
        {
            block = block->next.load(std::memory_order_relaxed);
            if (block == _head.load(std::memory_order_acquire))
            {
                block = new Block(_blockSize, block);
                tailBlock->next.store(block, std::memory_order_relaxed);
                tail = 0;
                ZERO_LOG_INFO("%s", "SCSP increase");
            }
            else
            {
                tail = block->tail.load(std::memory_order_relaxed);
                // if (tail != block->head.load(std::memory_order_acquire))
                // {
                //     ZERO_LOG_ERROR("%s", "block should be empty");
                // }
            }
        }

        // if (block->data[tail])
        // {
        //     ZERO_LOG_ERROR("%s", "block->data[tail]");
        // }
        block->data[tail] = std::forward<T>(val);
        block->tail.store((tail + 1) % block->data.size(), std::memory_order_release);
        _tail.store(block, std::memory_order_release);
    }

    bool pop(T &val)
    {
        Block *block = _head.load(std::memory_order_relaxed);
        uint32_t head = block->head.load(std::memory_order_relaxed);

        if (head == block->tail.load(std::memory_order_acquire))
        {
            if (block == _tail.load(std::memory_order_acquire))
            {
                return false;
            }

            // Image this sequence:
            // 1. The current block is empty
            // 2. The producer fills the block up and moves tail to the next block
            // At this moment, the consumer should not move head to the next block
            if ((block->tail.load(std::memory_order_acquire) + 1) % block->data.size() == head)
            {
                return pop(val);
            }

            // next must be full if next != tail, or be non-empty if next == tail( tail != head means tail has advanced, means it has filled one )
            block = block->next.load(std::memory_order_relaxed);
            head = block->head.load(std::memory_order_relaxed);

            // if (block != _tail.load(std::memory_order_acquire))
            // {
            //     if ((block->tail.load(std::memory_order_acquire) + 1) % block->data.size() != head)
            //     {
            //         ZERO_LOG_ERROR("%s", "block should be full");
            //     }
            // }
            // else if (head == block->tail.load(std::memory_order_acquire))
            // {
            //     ZERO_LOG_ERROR("%s", "block should be non-empty");
            // }
        }

        val = std::move(block->data[head]);
        block->head.store((head + 1) % block->data.size(), std::memory_order_release);
        _head.store(block, std::memory_order_release);

        return true;
    }

    bool any()
    {
        Block *block = _head.load(std::memory_order_relaxed);
        uint32_t head = block->head.load(std::memory_order_relaxed);

        if (head == block->tail.load(std::memory_order_acquire))
        {
            if (block == _tail.load(std::memory_order_acquire))
            {
                return false;
            }

            if ((block->tail.load(std::memory_order_acquire) + 1) % block->data.size() == head)
            {
                return any();
            }
        }

        return true;
    }
};