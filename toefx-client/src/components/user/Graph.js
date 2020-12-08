import React, { PureComponent } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const data = [
    {
        name: '2020/11/10', fungus: 50, amt: 2400,
    },
    {
        name: '2020/11/10', fungus: 40, amt: 2210,
    },
    {
        name: '2020/11/10', fungus: 60, amt: 2290,
    },
    {
        name: '2020/11/10', fungus: 40, amt: 2000,
    },
    {
        name: '2020/11/10', fungus: 1, amt: 2181,
    },
    {
        name: '2020/11/10', fungus: 10, amt: 2500,
    },
    {
        name: '2020/11/10', fungus: 50, amt: 2100,
    },
];

export default class Graph extends PureComponent {

    render() {
        return (
            <div>
                <div className="graph-y-title-container">
                    <h6 className="graph-y-title-text">Fungal Coverage (%)</h6>
                </div>
                <ResponsiveContainer width="95%" height={400}>
                <LineChart
                    data={data}
                    style={{color : "lightblue"}}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="fungus" stroke="#8884d8" activeDot={{ r: 6 }} />
                </LineChart>
                </ResponsiveContainer>
            </div>
        );
    }
}
