import { Handle, Position, NodeProps } from '@xyflow/react';
import { Mail, Tag, RefreshCw, Link2, PlayCircle, Clock, Split } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const icons = {
    trigger: PlayCircle,
    action_email: Mail,
    action_tag: Tag,
    action_status: RefreshCw,
    action_webhook: Link2,
    action_delay: Clock,
    condition: Split,
    default: PlayCircle
};

const colors = {
    trigger: 'bg-slate-900 border-slate-900 text-white',
    action_email: 'bg-violet-100 border-violet-500 text-violet-700',
    action_tag: 'bg-blue-100 border-blue-500 text-blue-700',
    action_status: 'bg-orange-100 border-orange-500 text-orange-700',
    action_webhook: 'bg-pink-100 border-pink-500 text-pink-700',
    action_delay: 'bg-yellow-100 border-yellow-500 text-yellow-700',
    condition: 'bg-amber-100 border-amber-500 text-amber-700',
    default: 'bg-white border-slate-200 text-slate-700'
};

export function CustomNode({ data, selected }: NodeProps) {
    const type = (data.nodeType as string) || 'default';
    const Icon = icons[type as keyof typeof icons] || icons.default;
    const colorClass = colors[type as keyof typeof colors] || colors.default;

    return (
        <div className={cn(
            "px-4 py-3 shadow-md rounded-xl border-2 min-w-[180px] bg-white transition-all duration-200 relative !overflow-visible",
            selected ? "ring-2 ring-primary ring-offset-2 border-primary" : "border-slate-200",
        )}>
            {/* Horizontal Layout Handles: Left Input, Right Output */}
            {type !== 'trigger' && (
                <Handle type="target" position={Position.Left} className="w-3 h-3 bg-slate-400 !border-2 !border-white" style={{ zIndex: 50 }} />
            )}

            <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg shrink-0", colorClass.split(' ')[0], colorClass.split(' ')[2])}>
                    <Icon className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900">{data.label as string}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                        {type === 'trigger' ? 'Início' : type === 'condition' ? 'Condição' : 'Ação'}
                    </span>
                </div>
            </div>

            {/* Form Selector for Trigger */}
            {type === 'trigger' && Array.isArray(data.availableForms) && (
                <div className="mt-3">
                    <div className="text-[10px] text-muted-foreground mb-1">Formulário</div>
                    <Badge variant="outline" className="text-[10px] font-normal w-full justify-start truncate">
                        {(data.availableForms as any[]).find((f: any) => f.id === (data.config as any)?.formId)?.name || 'Qualquer Formulário'}
                    </Badge>
                </div>
            )}

            {/* Display small badged config info if available */}
            {!!data.config && Object.keys(data.config as object).length > 0 && type !== 'trigger' && (
                <div className="mt-3 flex flex-wrap gap-1">
                    {(data.config as any).tags && (data.config as any).tags.map((t: string) => (
                        <Badge key={t} variant="secondary" className="text-[10px] px-1 h-5">{t}</Badge>
                    ))}
                    {(data.config as any).status && (
                        <Badge variant="outline" className="text-[10px] px-1 h-5">{(data.config as any).status}</Badge>
                    )}
                    {(data.config as any).url && (
                        <code className="text-[9px] bg-slate-100 px-1 rounded truncate max-w-full">{(data.config as any).url}</code>
                    )}
                    {(data.config as any).templateName && (
                        <Badge variant="secondary" className="text-[10px] px-1 h-5">📧 {(data.config as any).templateName}</Badge>
                    )}
                    {type === 'condition' && (data.config as any).field && (
                        <Badge variant="secondary" className="text-[10px] px-1 h-5 flex gap-1">
                            {String((data.config as any).fieldLabel || (data.config as any).field)} {(data.config as any).operator === 'equals' ? '=' : '!='} {String((data.config as any).value)}
                        </Badge>
                    )}
                </div>
            )}

            {/* Output Handles */}
            {type === 'condition' ? (
                <>
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="true"
                        className="w-3 h-3 bg-green-500 !border-2 !border-white"
                        style={{ top: '30%', right: '-6px', zIndex: 50 }}
                    />
                    <div className="absolute -right-8 top-[20%] text-[9px] font-bold text-green-600 bg-green-50 px-1 rounded z-50">SIM</div>

                    <Handle
                        type="source"
                        position={Position.Right}
                        id="false"
                        className="w-3 h-3 bg-red-500 !border-2 !border-white"
                        style={{ top: '70%', right: '-6px', zIndex: 50 }}
                    />
                    <div className="absolute -right-8 top-[60%] text-[9px] font-bold text-red-600 bg-red-50 px-1 rounded z-50">NÃO</div>
                </>
            ) : (
                <Handle type="source" position={Position.Right} className="w-3 h-3 bg-slate-400 !border-2 !border-white" style={{ zIndex: 50 }} />
            )}
        </div>
    );
}
