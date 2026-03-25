'use client'

import React from 'react'

interface AnimatedGroupProps {
    children: React.ReactNode
    variants?: {
        container?: {
            visible?: {
                transition?: {
                    delayChildren?: number
                }
            }
        }
        item?: {
            hidden?: React.CSSProperties
            visible?: {
                opacity?: number
                y?: number
                transition?: {
                    type?: string
                    bounce?: number
                    duration?: number
                }
            }
        }
    }
    className?: string
}

export function AnimatedGroup({ children, variants, className }: AnimatedGroupProps) {
    return (
        <div className={className} aria-hidden="true">
            {children}
        </div>
    )
}
