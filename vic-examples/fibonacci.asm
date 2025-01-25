// Fibonacci Sequence
//
// Reads a single input that specifies
// the number of iterations.
//
// A good example input is "10".
    read
    store count
    load zero
    store a
    write
    load one
    store b
    write
iteration:
    load a
    add b
    store c
    write
    load b
    store a
    load c
    store b
    load count
    gotoz done
    sub one
    store count
    goto iteration
done:
    stop
