const QUANTUMSIZE = 50; // 1 QUANTUM
const INTERCHANGE = 10; // MILISECONDS
const QUANTUMINTERCHANGE = INTERCHANGE/QUANTUMSIZE; // 0.2 QUANTUM

const inputForm = document.querySelector('.inputForm');
const addInOutButton = document.querySelector('.addInOut');
const addProcessButton = document.querySelector('.addProcess');
const showResultsButton = document.querySelector('.showResults');

// const processes = [
//     {
//         arrivalTime: ,
//         needCPU: ,
//         InOut: [
//             {
//                 spendQuantum: ,
//                 needCPU: 
//             }
//         ]
//     }
// ]

let InOutData = [];

inputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log("what")
    let process = {
        arrivalTime: document.querySelector('#arrivalTime').value,
        needCPU: document.querySelector('#needCpu').value,
        InOut: InOutData
    }
    debugger
})