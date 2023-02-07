import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <main className="container">
        <h1>The Visual Computer</h1>
        <Cpu />
      </main>
    </div>
  );
}

function Cpu() {
  return (
    <div>
      <CpuRegister name='Instruction Register' value={0} />
      <CpuRegister name='Data Register' value={0} />
      <CpuRegister name='Program Counter' value={0} />
    </div>
  );
}

interface CpuRegisterProps {
  name: string;
  value: number;
}

function CpuRegister(props: CpuRegisterProps) {
  return (
    <article>
      <div>{props.name}</div>
      <input value={props.value} />
    </article>
  );
}

export default App;
