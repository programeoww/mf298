const SVGCircle = ({ value, className, strokeColor, bgColor, total = 60 }: { value: number, className?: string, strokeColor?: string, bgColor?: string, total?: number }) => {
    const radius = mapNumber(total - value, total, 0, 0, 360)
    
    return (
        <svg className={className} viewBox="0 0 100 100">
            <path fill="none" stroke={strokeColor} strokeWidth={value == 0 ? 0 : 7} strokeLinecap="round" d={describeArc(50, 50, 46, 0, radius)} />
            <circle className="fill-none" stroke={bgColor} strokeLinecap="round" strokeWidth={7} cx="50" cy="50" r="46"/>
        </svg>
    )
};

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {

    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);

    var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    var d = [
        "M", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");

    return d;
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

function mapNumber(number: number, in_min: number, in_max: number, out_min: number, out_max: number) {
    return (number - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

export default SVGCircle;