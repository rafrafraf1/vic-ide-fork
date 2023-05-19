    read
    store x
    load one
    store i
    read
LOOP:
    gotoz END    // if zero, stop
    sub x
    gotoz FOUND  // the number was found
    load i       // i++
    add one
    store i
    read         // read the next number
    goto LOOP
END:
    load zero    // write -1
    sub one
    write
    stop
FOUND:           // write i
    load i
    write
    stop
