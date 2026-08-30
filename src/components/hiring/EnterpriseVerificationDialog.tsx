import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/db/supabase';
import EnterpriseHiringSearch from '@/components/hiring/EnterpriseHiringSearch';
import EnterpriseHiringOverviewCard from '@/components/hiring/EnterpriseHiringOverviewCard';

interface EnterpriseHiringOverview {
  titleKw: string;
  titleType: string;
  city: string;
  src: string;
  titleLevel: string;
  avgSal: string;
  titleCnt: number;
  titleModifyDate: string;
  cityCnt: number;
}

interface EnterpriseVerificationDialogProps {
  trigger?: React.ReactNode;
}

export default function EnterpriseVerificationDialog({ trigger }: EnterpriseVerificationDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [overviewData, setOverviewData] = useState<EnterpriseHiringOverview | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  const handleSearch = async (keyword: string, forceRefresh = false) => {
    setLoading(true);
    setError(null);
    setOverviewData(null);
    setVerified(false);

    try {
      // 获取当前用户的 session
      const { data: { session } } = await supabase.auth.getSession();

      // 查询标准应用概况
      const { data: overviewResult, error: overviewError } = await supabase.functions.invoke('hire-overview', {
        body: { keyword, forceRefresh },
        headers: session?.access_token ? {
          Authorization: `Bearer ${session.access_token}`,
        } : {},
      });

      if (overviewError) {
        throw new Error(overviewError.message);
      }

      if (overviewResult.error) {
        throw new Error(overviewResult.error);
      }

      if (overviewResult.success && overviewResult.data) {
        setOverviewData(overviewResult.data);
        setFromCache(overviewResult.fromCache || false);
        setVerified(true);
        toast.success('企业核验成功');
      }
    } catch (err: any) {
      console.error('企业核验失败:', err);
      const errorMsg = err.message || '核验失败，请稍后重试';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Search className="mr-2 h-4 w-4" />
            企业核验
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>企业标准应用数据核验</DialogTitle>
          <DialogDescription>
            查询企业真实标准应用数据，核验企业活跃度和人才需求规模
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <EnterpriseHiringSearch onSearch={handleSearch} loading={loading} />

          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">正在核验企业数据...</span>
            </div>
          )}

          {error && !loading && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {verified && !loading && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                企业核验成功，该企业标准应用数据真实有效
              </AlertDescription>
            </Alert>
          )}

          {overviewData && !loading && (
            <EnterpriseHiringOverviewCard data={overviewData} fromCache={fromCache} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
