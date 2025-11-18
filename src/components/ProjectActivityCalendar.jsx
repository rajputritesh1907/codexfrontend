import React, { useState, useMemo, useEffect } from 'react';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function ProjectActivityCalendar({ projects = [], joinedDate }) {
    const [currentMonthOffset, setCurrentMonthOffset] = useState(0);
    
    // Calculate earliest project date or joined date
    const earliestDate = useMemo(() => {
        let earliest = joinedDate ? new Date(joinedDate) : new Date();
        
        // Look for earliest project date
        if (projects && projects.length > 0) {
            projects.forEach(project => {
                const projectDate = new Date(project.createdAt || project.date);
                if (!isNaN(projectDate.getTime()) && projectDate < earliest) {
                    earliest = projectDate;
                }
            });
        }
        
        // Set to first day of that month
        earliest.setDate(1);
        return earliest;
    }, [projects, joinedDate]);
    
    // Calculate the current month to display
    const currentMonth = useMemo(() => {
        const date = new Date();
        date.setMonth(date.getMonth() + currentMonthOffset);
        return date;
    }, [currentMonthOffset]);
    
    // Generate activity data for the current month
    const { calendarData, monthLabel, hasNextMonth, hasPrevMonth } = useMemo(() => {
        // Start with first day of month
        const startDate = new Date(currentMonth);
        startDate.setDate(1);
        
        // Get the month's end date
        const endDate = new Date(currentMonth);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0);
        
        // First day might not be Sunday, so backfill
        const firstDayOfWeek = startDate.getDay();
        const calendarStart = new Date(startDate);
        calendarStart.setDate(calendarStart.getDate() - firstDayOfWeek);
        
        // Create grid (up to 6 weeks)
        const grid = [];
        const now = new Date();
        
        // Track project activity
        const projectActivity = new Map();
        projects.forEach(project => {
            // Track both created and updated dates
            [project.createdAt, project.updatedAt, project.date].forEach(dateString => {
                if (!dateString) return;
                try {
                    const date = new Date(dateString);
                    if (isNaN(date.getTime())) return;
                    
                    // Format as YYYY-MM-DD for consistent keys
                    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                    projectActivity.set(key, (projectActivity.get(key) || 0) + 1);
                } catch (e) {}
            });
        });
        
        // Generate 7 columns (days of week) × up to 6 rows
        for (let row = 0; row < 6; row++) {
            const week = [];
            for (let col = 0; col < 7; col++) {
                const date = new Date(calendarStart);
                date.setDate(date.getDate() + (row * 7) + col);
                
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                const count = projectActivity.get(key) || 0;
                
                // Check if date is in the current month
                const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                
                week.push({
                    date,
                    count,
                    key,
                    isCurrentMonth,
                    isToday: date.toDateString() === now.toDateString(),
                    isPast: date < now
                });
            }
            grid.push(week);
            
            // If we've already passed the last day of month and completed the row, stop
            if (grid[grid.length-1][6].date > endDate) break;
        }
        
        // Determine if we can navigate to previous/next months
        const monthLabel = `${MONTH_NAMES[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;
        
        // Can go back if not at the earliest project date month
        const earliestYearMonth = `${earliestDate.getFullYear()}-${earliestDate.getMonth()}`;
        const currentYearMonth = `${currentMonth.getFullYear()}-${currentMonth.getMonth()}`;
        const hasPrevMonth = currentYearMonth !== earliestYearMonth;
        
        // Can go forward if not at current month
        const today = new Date();
        const todayYearMonth = `${today.getFullYear()}-${today.getMonth()}`;
        const hasNextMonth = currentYearMonth !== todayYearMonth;
        
        return { calendarData: grid, monthLabel, hasPrevMonth, hasNextMonth };
    }, [currentMonth, projects, earliestDate]);
    
    // Get color intensity based on count
    const getActivityColor = (count) => {
        if (count === 0) return 'bg-gray-800';
        if (count === 1) return 'bg-green-900';
        if (count === 2) return 'bg-green-700';
        if (count >= 3) return 'bg-green-500';
    };
    
    // Handle navigation
    const prevMonth = () => {
        if (hasPrevMonth) {
            setCurrentMonthOffset(currentMonthOffset - 1);
        }
    };
    
    const nextMonth = () => {
        if (hasNextMonth) {
            setCurrentMonthOffset(currentMonthOffset + 1);
        }
    };
    
    return (
        <div className="activity-calendar">
            <div className="flex justify-between items-center mb-4">
                <button 
                    onClick={prevMonth}
                    disabled={!hasPrevMonth}
                    className={`px-2 py-1 rounded ${hasPrevMonth ? 'text-indigo-300 hover:bg-gray-800' : 'text-gray-600 cursor-not-allowed'}`}
                >
                    ← Prev
                </button>
                <h3 className="font-medium">{monthLabel}</h3>
                <button 
                    onClick={nextMonth}
                    disabled={!hasNextMonth}
                    className={`px-2 py-1 rounded ${hasNextMonth ? 'text-indigo-300 hover:bg-gray-800' : 'text-gray-600 cursor-not-allowed'}`}
                >
                    Next →
                </button>
            </div>
            
            <div className="grid grid-cols-[auto,1fr] gap-2">
                {/* Day of week labels */}
                <div className="row-span-6"></div> {/* Empty cell for alignment */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                    {DAYS_OF_WEEK.map(day => (
                        <div key={day} className="text-xs text-center text-gray-500">{day}</div>
                    ))}
                </div>
                
                {/* Calendar grid */}
                {calendarData.map((week, weekIndex) => (
                    <React.Fragment key={weekIndex}>
                        {/* Week day label (show only for some days) */}
                        {weekIndex % 2 === 0 && (
                            <div className="text-xs text-gray-500 pr-2 flex items-center justify-end">
                                {DAYS_OF_WEEK[week[0].date.getDay()]}
                            </div>
                        )}
                        <div className="grid grid-cols-7 gap-1">
                            {week.map((day) => (
                                <div
                                    key={day.key}
                                    className={`w-4 h-4 rounded-sm ${day.isCurrentMonth ? getActivityColor(day.count) : 'bg-gray-900'} ${day.isToday ? 'ring-1 ring-white/30' : ''}`}
                                    title={`${day.date.toLocaleDateString()} - ${day.count} activities`}
                                ></div>
                            ))}
                        </div>
                    </React.Fragment>
                ))}
            </div>
            
            <div className="flex justify-end mt-2 items-center gap-2 text-xs">
                <span className="text-gray-500">Less</span>
                <div className="w-3 h-3 rounded-sm bg-gray-800"></div>
                <div className="w-3 h-3 rounded-sm bg-green-900"></div>
                <div className="w-3 h-3 rounded-sm bg-green-700"></div>
                <div className="w-3 h-3 rounded-sm bg-green-500"></div>
                <span className="text-gray-500">More</span>
            </div>
        </div>
    );
}