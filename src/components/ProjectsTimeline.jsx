import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';

// projects: array of { createdAt?, date?, endDate?, durationDays? }
// days: number of days to render (default 7)
export default function ProjectsTimeline({ projects = [], days = 7 }) {
    const data = useMemo(() => {
        const now = new Date();
        // Normalize to start of day
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const start = new Date(end);
        start.setDate(start.getDate() - (days - 1));

        // Prepare array of day objects
        const dayArr = [];
        for (let i = 0; i < days; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            dayArr.push({ date: new Date(d), label: d.toLocaleString('en', { weekday: 'short', day: 'numeric' }).toUpperCase(), count: 0 });
        }

        // Helper to parse a possible date-like value
        const parseDate = (v) => {
            if (!v) return null;
            const d = new Date(v);
            return isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
        };

        // For each project, determine start and end day (inclusive)
        projects.forEach(p => {
            try {
                const s = parseDate(p.createdAt || p.date);
                if (!s) return;
                let e = null;
                if (p.endDate) e = parseDate(p.endDate);
                else if (p.durationDays && Number(p.durationDays) > 1) {
                    e = new Date(s);
                    e.setDate(e.getDate() + (Number(p.durationDays) - 1));
                } else {
                    e = s;
                }

                // Increment counts for each day that falls within [s,e]
                dayArr.forEach(dobj => {
                    if (dobj.date >= s && dobj.date <= e) dobj.count++;
                });
            } catch (err) { }
        });

        return dayArr.map(d => ({ name: d.label, value: d.count }));
    }, [projects, days]);

    return (
        <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <XAxis dataKey="name" stroke="#888" fontSize={11} />
                <Tooltip />
                <Bar dataKey="value" fill="#4F46E5" radius={[6, 6, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}
