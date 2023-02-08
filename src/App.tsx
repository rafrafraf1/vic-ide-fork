import React from 'react';
import logo from './logo.svg';
import './App.css';
import { ValueCellInput } from './UI/ValueCellInput';

function App() {
  return (
    <div className="App">
      <ValueCellInput
        value={323}
      />
      <main className="container">
        <div className="Vic-Simulator">
          <div>
            <InputIo />
            <OutputIo />
          </div>
          <Cpu />
          <MemorySegment />
        </div>
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

function InputIo() {
  return (
    <article className="Vic-Input">
      <h6>Input</h6>
      <input className="Vic-Input-Active" value="" />
      <input value="" />
      <input value="" />
      <input value="" />
      <input value="" />
      <input value="" />
    </article>
  );
}

function OutputIo() {
  return (
    <article className="Vic-Input">
      <h6>Output</h6>
      <input className="Vic-Output-Active" value="" />
      <input value="" />
      <input value="" />
      <input value="" />
      <input value="" />
      <input value="" />
    </article>
  );
}

function MemorySegment() {
  return (
    <article>
      <h6>Main Memory</h6>
      <div className="Vic-Memory-Cell"><label>00</label><input value="800" /></div>
      <div className="Vic-Memory-Cell"><label>01</label><input value="900" /></div>
      <div className="Vic-Memory-Cell"><label>02</label><input value="500" /></div>
      <div className="Vic-Memory-Cell"><label>03</label><input value="0" /></div>
      <div className="Vic-Memory-Cell"><label>04</label><input value="0" /></div>
      <div className="Vic-Memory-Cell"><label>05</label><input value="0" /></div>
      <div className="Vic-Memory-Cell"><label>06</label><input value="0" /></div>
      <div className="Vic-Memory-Cell"><label>07</label><input value="0" /></div>
      <div className="Vic-Memory-Cell"><label>08</label><input value="0" /></div>
      <div className="Vic-Memory-Cell"><label>09</label><input value="0" /></div>
      <div className="Vic-Memory-Cell"><label>10</label><input value="0" /></div>
      <div className="Vic-Memory-Cell"><label>11</label><input value="0" /></div>
      <div className="Vic-Memory-Cell"><label>12</label><input value="0" /></div>
      <div className="Vic-Memory-Cell"><label>13</label><input value="0" /></div>
      <div className="Vic-Memory-Cell"><label>14</label><input value="0" /></div>
      <div className="Vic-Memory-Cell"><label>15</label><input value="0" /></div>
      <div className="Vic-Memory-Cell"><label>16</label><input value="0" /></div>
    </article>
  );
}

export default App;
