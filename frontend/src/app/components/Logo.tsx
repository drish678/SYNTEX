import svgPaths from "../../imports/svg-uzsgl7amxv";

export default function Logo() {
  return (
    <div className="relative w-full h-full" style={{ transform: 'rotate(8deg)' }}>
      {/* Top dot of semicolon */}
      <div className="absolute bg-gradient-to-b from-[#1449dd] to-[#7500fa] opacity-95 rounded-full left-[35%] top-0 w-[31.25%] h-[31.25%]" 
           style={{ 
             filter: 'drop-shadow(0 0 6px rgba(117, 0, 250, 0.6)) drop-shadow(0 0 12px rgba(117, 0, 250, 0.4))',
             boxShadow: '0px 10px 15px 0px rgba(0,0,0,0.1), 0px 4px 6px 0px rgba(0,0,0,0.1)'
           }} />
      
      {/* Bottom comma/tail of semicolon */}
      <div className="absolute left-[6.25%] top-[37.5%] w-[75%] h-[62.5%]"
           style={{ filter: 'drop-shadow(0 0 6px rgba(117, 0, 250, 0.6)) drop-shadow(0 0 12px rgba(117, 0, 250, 0.4))' }}>
        <svg className="block w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 192 160">
          <path d={svgPaths.p2cd02f00} fill="url(#paint0_linear_logo)" opacity="0.95" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_logo" x1="-115.516" x2="637.047" y1="-39.7428" y2="224.091">
              <stop offset="0.271831" stopColor="#1449DD" stopOpacity="0.95" />
              <stop offset="0.341346" stopColor="#7500FA" stopOpacity="0.95" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}