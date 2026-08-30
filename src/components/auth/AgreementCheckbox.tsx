import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface Props {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export default function AgreementCheckbox({ checked, onCheckedChange }: Props) {
  return (
    <div className="flex items-start space-x-2 my-4">
      <Checkbox id="terms" checked={checked} onCheckedChange={onCheckedChange} />
      <div className="grid gap-1.5 leading-none">
        <Label htmlFor="terms" className="text-xs text-muted-foreground font-normal">
          我已阅读并同意
          <a href="#" className="text-primary hover:underline" onClick={(e) => { e.preventDefault(); alert('《用户协议》详细内容') }}>《用户协议》</a>
          和
          <a href="#" className="text-primary hover:underline" onClick={(e) => { e.preventDefault(); alert('《隐私政策》详细内容') }}>《隐私政策》</a>
        </Label>
      </div>
    </div>
  );
}
