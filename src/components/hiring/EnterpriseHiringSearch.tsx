import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface EnterpriseHiringSearchProps {
  onSearch: (keyword: string, forceRefresh?: boolean) => void;
  loading?: boolean;
}

export default function EnterpriseHiringSearch({ onSearch, loading }: EnterpriseHiringSearchProps) {
  const [keyword, setKeyword] = useState('');

  const handleSearch = (forceRefresh = false) => {
    if (!keyword.trim()) {
      toast.error('请输入企业名称或统一信用代码');
      return;
    }
    onSearch(keyword.trim(), forceRefresh);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="keyword">企业名称或统一信用代码</Label>
        <div className="flex gap-2">
          <Input
            id="keyword"
            placeholder="请输入企业名称、统一信用代码、注册号或企业历史名称"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            disabled={loading}
          />
          <Button
            onClick={() => handleSearch()}
            disabled={loading}
          >
            <Search className="mr-2 h-4 w-4" />
            查询
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSearch(true)}
            disabled={loading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            刷新
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          支持输入企业全称、统一信用代码、注册号或企业历史名称进行查询
        </p>
      </div>
    </div>
  );
}
