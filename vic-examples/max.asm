// read two inputs and write their maximum
    read
    store x // x is in M[90]
    read
    store y // y is in M[91]
    sub x // D = y - x
    gotop skip // if D>0 goto 09
    load x // write x
    write
    stop
skip:
    load y // write y
    write
    stop
