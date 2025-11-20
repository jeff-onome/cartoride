import { useState, useEffect } from 'react';

const calculateTimeLeft = (targetDate: Date) => {
    const difference = +targetDate - +new Date();
    let timeLeft = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
    };

    if (difference > 0) {
        timeLeft = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
            isExpired: false,
        };
    }

    return timeLeft;
};

export const useCountdown = (targetDate: Date) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft(targetDate));
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    return timeLeft;
};
