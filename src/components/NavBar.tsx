import React from 'react'
import MaxWidthWrapper from './MaxWidthWrapper'
import Link from 'next/link'
import { buttonVariants } from './ui/button'
import { LoginLink, RegisterLink } from '@kinde-oss/kinde-auth-nextjs/server'
import { ArrowRight } from 'lucide-react'

const NavBar = () => {
  return (
    <nav className='sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-100 bg-white/70 backdrop-blur-lg transition-all'>
        <MaxWidthWrapper>
            <div className='flex h-14 items-center justify-between border-b border-zinc-200'>
                <Link href='/' className='flex z-40 font-semibold'>
                    <span>PDFile.</span>
                </Link>
                {/* todo: Add mobile navbar */}

                <div className='hidden items-center space-x-4 sm:flex'>
                    <>
                        <Link className={buttonVariants({
                            variant: 'ghost',
                            size: 'sm'
                        })} href='/pricing'>Pricing</Link>
                        <LoginLink className={buttonVariants({
                            variant: 'ghost',
                            size: 'sm'
                        })}>Sign In</LoginLink>
                        <RegisterLink className={buttonVariants({
                            size: 'sm'
                        })}>Get Started <ArrowRight className='ml-1.5 h-5 w-6' /> </RegisterLink>
                    </>
                </div>
            </div>
        </MaxWidthWrapper>
    </nav>
  )
}

export default NavBar
