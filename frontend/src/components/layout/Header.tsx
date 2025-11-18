'use client'

import { Link } from "react-router-dom"
import { Rocket, Globe, LogOut } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"
import { t } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Language } from "@/lib/i18n"
import { useState } from "react"

const languages = [
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
] as const

const Header = () => {
  const { language, setLanguage } = useLanguage()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')

  const currentLang = languages.find(l => l.code === language)

  const handleLogin = () => {
    // Demo: set logged in state with example name
    setUserName('User')
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserName('')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo and Title */}
        <Link to="/" className="flex items-center gap-3 transition-transform hover:scale-105">
          <div className="rounded-lg bg-gradient-to-br from-primary to-accent p-2">
            <Rocket className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t(language, 'appTitle')}
            </span>
            <span className="text-xs text-muted-foreground -mt-1">
              {t(language, 'appSubtitle')}
            </span>
          </div>
        </Link>

        {/* Right: Language Switcher & Auth */}
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-2 rounded-md border border-border hover:bg-muted transition-colors cursor-pointer">
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">{currentLang?.flag} {currentLang?.name}</span>
                <span className="text-sm font-medium sm:hidden">{currentLang?.flag}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {languages.map((lang) => (
                <DropdownMenuItem 
                  key={lang.code} 
                  onClick={() => setLanguage(lang.code as Language)}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Auth Section */}
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 rounded-md border border-border hover:bg-muted transition-colors cursor-pointer">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-semibold">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">{userName}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="cursor-pointer flex items-center gap-2 text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{language === 'ko' ? '로그아웃' : language === 'en' ? 'Logout' : 'ログアウト'}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              onClick={handleLogin}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              {language === 'ko' ? '로그인' : language === 'en' ? 'Login' : 'ログイン'}
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
