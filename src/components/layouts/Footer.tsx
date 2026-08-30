import { Link } from 'react-router-dom';
import { Mail, Github, Brain } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* 平台信息 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden">
                <img 
                  src="https://miaoda-conversation-file.cdn.bcebos.com/user-6m37scl45nuo/conv-a7lm1eejtyps/20260402/file-ao6wt1jg4um8.jpg@w_1659" 
                  alt="芒小橘" 
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="text-lg font-bold gradient-text">AI胜任力评估</span>
            </div>
            <p className="text-sm text-muted-foreground">
              基于新质生产力背景下的AI人才能力标准模型，为AI时代人才提供精准评估与匹配服务。
            </p>
          </div>

          {/* 快速链接 */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">快速链接</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/assessment" className="text-muted-foreground hover:text-primary transition-colors">
                  能力评估
                </Link>
              </li>
              <li>
                <Link to="/positions" className="text-muted-foreground hover:text-primary transition-colors">
                  标准库
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-muted-foreground hover:text-primary transition-colors">
                  个人中心
                </Link>
              </li>
            </ul>
          </div>

          {/* 研究课题 */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">研究课题</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-muted-foreground">新质生产力背景下</li>
              <li className="text-muted-foreground">人工智能与能力标准</li>
              <li className="text-muted-foreground">胜任模型研究</li>
            </ul>
          </div>

          {/* 联系方式 */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">联系我们</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a href="mailto:2468001320@qq.com" className="hover:text-primary transition-colors">
                  2468001320@qq.com
                </a>
              </li>
              <li className="flex items-center space-x-2 text-muted-foreground">
                <Github className="h-4 w-4 flex-shrink-0" />
                <a 
                  href="https://github.com/TrueFurina" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  TrueFurina
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* 版权信息 */}
        <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>© {currentYear} 芒得很职. All rights reserved.</p>
          <p className="mt-2 text-xs">基于产教融合创新课题研究</p>
        </div>
      </div>
    </footer>
  );
}
