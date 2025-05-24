import React, {useEffect, useState} from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Plot from 'react-plotly.js';
import {ThumbsUp, X, CircleAlert} from 'lucide-react';
import './tailwind.css';


function TableMode({setModalOpen, setSpectrum}) {
    console.log('TABLE MODE')

    const [targetData, setTargetData] = useState(null);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        console.log('TABLE MODE USE EFFECT');
        fetch('/api/targets', {headers:{'Cache-Control':'no-store'}}).then(res => res.json()).then(data => {
            setTargetData(data);
        });
    }, []);

    const handleCellClick = async (target, line) => {
        console.log('Cell Clicked!');
        const s = {'target':target,'line':line}
        setSelected(s);
        console.log('selected', JSON.stringify(s));
        setModalOpen(true);

        fetch('/api/spectrum', {method:'POST',
                                headers:{'Content-Type':'application/json','Cache-Control': 'no-store'},
                                body:JSON.stringify(s)}).then(res => res.json()).then(data => {
                                    setSpectrum(data)
                                });
    };

    if (!targetData) return <div color='#e2e8f0'>Loading...</div>

    console.log('data', targetData);
    console.log('lines', targetData?.lines);

    targetData?.lines.map((line) => console.log(line));

    return (
        <div className='overflow-x-auto p-8'>
            <table className='table-auto border-collapse border border-gray-300'>
                <thead>
                    <tr>
                        <th className='cell border border-gray-300 px-8 py-2'>Target</th>
                        {targetData?.lines.map(line =>
                            <th key={line} className='cell border border-gray-300 px-8, py-2'>{line}</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(targetData?.targets).map(target => (
                        <tr>
                            <td className='cell border border-gray-300 px-8 py-2 font-medium'>{target}</td>
                            {targetData?.targets?.[target]?.map(line => {
                                return (
                                <td className='cell border border-gray-300 text-center cursor-pointer hover:bg-blue-100' horizontal-align='center' onClick={() => handleCellClick(target,line)}>
                                    {(line === 1) ? <ThumbsUp color='#86efac' size={24}/> : (line === -1) ? <X color='red' size={24}/> : <CircleAlert color='yellow' size={24}/>}
                                </td>)
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}


function SpectrumViewer({isOpen, onClose, spectrum}) {
    console.log('SpectrumViewer');
    console.log('open', isOpen);
    console.log('spectrum', spectrum);

    if (!spectrum) return <div>Loading...</div>

    return (
        <Dialog open={isOpen} onClose={onClose} fullScreen='true'>
            <DialogTitle>Spectrum</DialogTitle>
            <DialogContent>
                {spectrum ? (
                    <Plot
                        data={[
                            {
                                x: spectrum.wave,
                                y: spectrum.flux,
                                type: 'scatter',
                                mode: 'lines',
                                marker: {color:'#e9d8a6'},
                                line: 'hvh',
                            },
                            ]}
                        layout={{
                            title:'Spectral Plot',
                            paper_bgcolor: '#005f73',
                            plot_bgcolor: '#005f73',
                            font: {color: '#94d2bd', size:16},
                            modebar: {color: '#aec3b0', activecolor: '#94d2bd'},
                            xaxis: {color: '#94d2bd'},
                            yaxis: {color: '#94d2bd'},
                            shapes:[{
                                type: 'line',
                                x0:5007,x1:5007,y0:Math.min(...spectrum.flux)-0.1*Math.max(...spectrum.flux),y1:Math.max(...spectrum.flux)+0.1*Math.max(...spectrum.flux),
                                line: {color:'#ca6702', dash:'dash'}
                            }]
                        }}
                        style={{width:'100%', height:'80%'}}
                      />
                ) : (
                    <div className='text-gray-600'>Loading Spectrum...</div>
                )}
            </DialogContent>
        </Dialog>
    );
}


function App() {
    console.log('START');

    const [modalOpen, setModalOpen] = useState(false);
    const [spectrum, setSpectrum] = useState<{wave:number[];flux:number[]}|null>(null);

    return (
        <div className='min-h-screen text-gray-900'>
            <header className='shadow p-4'>
                <h1 className='text-2xl font-bold'>Spectra Explorer</h1>
            </header>
            <main className='p-6'>
                <TableMode setModalOpen={setModalOpen} setSpectrum={setSpectrum}/>
                <SpectrumViewer isOpen={modalOpen} onClose={() => setModalOpen(false)} spectrum={spectrum}/>
            </main>
        </div>
    )
}

export default App;

