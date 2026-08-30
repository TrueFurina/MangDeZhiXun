// 企业招聘数据统计 Edge Function
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 获取请求参数
    const { keyword, forceRefresh = false } = await req.json();

    if (!keyword) {
      return new Response(
        JSON.stringify({ error: '缺少必填参数：keyword（企业名称/统一信用代码）' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 初始化 Supabase 客户端
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 获取认证用户
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }

    // 检查缓存（如果不强制刷新）
    if (!forceRefresh) {
      const { data: cachedData } = await supabase
        .from('enterprise_hiring_cache')
        .select('*')
        .eq('keyword', keyword)
        .gte('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // 7天缓存
        .maybeSingle();

      if (cachedData && cachedData.zpnumber !== null) {
        return new Response(
          JSON.stringify({
            success: true,
            code: 200,
            data: {
              avgSalStr: cachedData.avg_sal_str,
              avgSal: cachedData.avg_sal_num,
              bkEducation: cachedData.bk_education,
              educationList: cachedData.education_list || [],
              priProvince: cachedData.pri_province,
              companyName: cachedData.company_name,
              zpnumberList: cachedData.zpnumber_list || [],
              salaryList: cachedData.salary_list || [],
              btw3and5Years: cachedData.btw3and5_years,
              recruitPosition: cachedData.recruit_position || [],
              yearsList: cachedData.years_list || [],
              zpnumber: cachedData.zpnumber,
              ssNumHisList: cachedData.ss_num_his_list || [],
            },
            fromCache: true,
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // 获取API密钥
    const apiKey = Deno.env.get('INTEGRATIONS_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API密钥未配置' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 调用第三方API
    const apiUrl = 'https://app-a7lm1eejtypt-api-zYkZzErqJg4L-gateway.appmiaoda.com/enterprise/hire-statistics';
    
    const formData = new URLSearchParams();
    formData.append('keyword', keyword);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'X-Gateway-Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    // 检查响应状态
    if (response.status === 429) {
      return new Response(
        JSON.stringify({ error: 'API调用频率超限，请稍后再试' }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (response.status === 402) {
      return new Response(
        JSON.stringify({ error: 'API余额不足' }),
        { 
          status: 402, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();

    // 记录查询历史
    if (userId) {
      await supabase.from('enterprise_hiring_query_history').insert({
        user_id: userId,
        keyword,
        query_type: 'statistics',
        success: data.success && data.code === 200,
        error_message: data.success ? null : data.msg,
      });
    }

    // 检查业务状态码
    if (!data.success || data.code !== 200) {
      let errorMsg = '查询失败';
      if (data.code === 201) {
        errorMsg = '查无数据，请检查企业名称或信用代码是否正确';
      } else if (data.code === 400) {
        errorMsg = '参数错误';
      } else if (data.code === 500) {
        errorMsg = '系统维护中，请稍后再试';
      } else if (data.msg) {
        errorMsg = data.msg;
      }

      return new Response(
        JSON.stringify({ error: errorMsg, code: data.code }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 保存到缓存
    await supabase.from('enterprise_hiring_cache').upsert({
      keyword,
      company_name: data.data.companyName,
      avg_sal_str: data.data.avgSalStr,
      avg_sal_num: data.data.avgSal,
      bk_education: data.data.bkEducation,
      education_list: data.data.educationList || [],
      pri_province: data.data.priProvince,
      zpnumber_list: data.data.zpnumberList || [],
      salary_list: data.data.salaryList || [],
      btw3and5_years: data.data.btw3and5Years,
      recruit_position: data.data.recruitPosition || [],
      years_list: data.data.yearsList || [],
      zpnumber: data.data.zpnumber,
      ss_num_his_list: data.data.ssNumHisList || [],
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'keyword',
    });

    // 返回成功数据
    return new Response(
      JSON.stringify({ ...data, fromCache: false }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('招聘数据统计查询错误:', error);
    return new Response(
      JSON.stringify({ error: error.message || '服务器内部错误' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
