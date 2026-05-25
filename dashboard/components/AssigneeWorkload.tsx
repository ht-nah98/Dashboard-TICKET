export function AssigneeWorkload({ data }: { data: any[] }) {
  const max = Math.max(...data.map((d) => d.open), 1);
  return (
    <div className="gcard gcard-fill w-full p-5">
      <div className="mb-3 shrink-0">
        <div className="text-[14px] font-medium text-gink">Khối lượng theo nhân sự</div>
        <div className="text-[12px] text-gmuted">Số ticket đang mở · critical · trễ SLA</div>
      </div>
      <div className="scroll-body flex-1 -mr-2 pr-2 space-y-2" style={{ maxHeight: 300 }}>
        {data.map((a) => {
          const total = a.open;
          const critPct = (a.critical / max) * 100;
          const breachPct = (a.breached / max) * 100;
          const restPct = ((a.open - a.critical) / max) * 100;
          return (
            <div key={a.user_id} className="flex items-center gap-3 text-[12px]">
              <div className="w-32 truncate">
                <div className="font-medium text-gink truncate">{a.user_name}</div>
                <div className="text-[10px] text-gmuted">{a.role}</div>
              </div>
              <div className="flex-1 h-6 bg-gbg rounded-md relative overflow-hidden flex">
                <div className="bg-gblue h-full" style={{ width: `${restPct}%` }} title={`${a.open - a.critical} mở thường`} />
                <div className="bg-gamber h-full" style={{ width: `${critPct - breachPct}%` }} title={`${a.critical - a.breached} critical`} />
                <div className="bg-gred h-full" style={{ width: `${breachPct}%` }} title={`${a.breached} trễ SLA`} />
              </div>
              <div className="w-20 text-right tabular-nums">
                <span className="font-medium text-gink">{a.open}</span>{" "}
                <span className="text-gmuted">/ {a.critical}c</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-3 pt-2 border-t border-gborder text-[10px] text-gmuted shrink-0">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-gblue rounded-sm" /> Mở thường</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-gamber rounded-sm" /> Critical</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-gred rounded-sm" /> Trễ SLA</span>
      </div>
    </div>
  );
}
