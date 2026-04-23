"use client"

/**
 * Mailopoly MCP-B Tool Registration
 *
 * Exposes app functionality as structured MCP tools via the WebMCP standard.
 * The MCP-B Chrome extension connects to these tools and relays them to
 * Claude Desktop, Claude Code, Cursor, or any standard MCP client.
 *
 * Install the MCP-B Chrome extension to use:
 * https://chromewebstore.google.com/detail/mcp-b/
 *
 * Tools are registered once in a useEffect to avoid duplicate registrations in React Strict Mode.
 */

import React, { useCallback, useEffect, useRef, useState, Component, ErrorInfo } from 'react'
import { useUICommand } from '@/contexts/UICommandContext'
import { useEmailFilter } from '@/contexts/EmailContext'
import { usePolyChat } from '@/contexts/PolyChatContext'
import { useSenders } from '@/contexts/SendersContext'
import { useWebMCP, useWebMCPContext } from '@mcp-b/react-webmcp'
import type { JsonSchemaForInference } from '@mcp-b/webmcp-types'

// Error boundary to catch MCP-B library errors
class MCPErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    // Check if this is an MCP-B related error
    if (error.message &&
        (error.message.includes('Duplicate tool name') ||
         error.message.includes('unregisterTool') ||
         error.message.includes('InvalidStateError') ||
         error.message.includes('Failed to execute \'registerTool\''))) {
      // Don't show error state for MCP-B bugs
      return { hasError: false }
    }
    // For other errors, show error state
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Check if this is an MCP-B related error
    if (error.message &&
        (error.message.includes('Duplicate tool name') ||
         error.message.includes('unregisterTool') ||
         error.message.includes('InvalidStateError') ||
         error.message.includes('Failed to execute \'registerTool\''))) {
      // Silently ignore MCP-B library bugs
      console.debug('MCP-B library error caught and ignored:', error.message)
      return
    }

    // For other errors, log them
    console.error('Error boundary caught error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // Render nothing for non-MCP-B errors (shouldn't happen with our current code)
      return null
    }

    return this.props.children
  }
}

// Comprehensive MCP-B error suppression and patching
function setupMCPBPatching() {
  if (typeof window !== 'undefined') {
    // Override console methods to suppress MCP-B errors
    const originalConsoleError = console.error
    const originalConsoleWarn = console.warn

    console.error = (...args) => {
      const message = args.join(' ')
      // Suppress known MCP-B library bugs
      if (message.includes('unregisterTool is not a function') ||
          message.includes('Failed to unregister tool') ||
          message.includes('Duplicate tool name') ||
          message.includes('InvalidStateError')) {
        return // Silently ignore
      }
      originalConsoleError.apply(console, args)
    }

    console.warn = (...args) => {
      const message = args.join(' ')
      // Suppress MCP-B warnings too
      if (message.includes('[ReactWebMCP:useWebMCP]') &&
          (message.includes('unregister') || message.includes('Duplicate'))) {
        return
      }
      originalConsoleWarn.apply(console, args)
    }

    // Patch the global MCP-B object when it becomes available
    let patchAttempts = 0
    const maxPatchAttempts = 50 // 5 seconds max

    const applyPatches = () => {
      // Try to patch ModelContext prototype (this is where the error occurs)
      if ((window as any).ModelContext && (window as any).ModelContext.prototype) {
        const proto = (window as any).ModelContext.prototype

        // Add missing unregisterTool method
        if (!proto.unregisterTool) {
          proto.unregisterTool = function() {
            // No-op - MCP-B doesn't support unregistering
          }
        }

        // Track registered tools globally on window to prevent duplicates
        if (!(window as any)._mailopolyRegisteredTools) {
          (window as any)._mailopolyRegisteredTools = new Set<string>()
        }

        // Wrap registerTool to prevent duplicates - catch errors and suppress duplicates
        if (!proto._originalRegisterTool) {
          proto._originalRegisterTool = proto.registerTool

          proto.registerTool = function(tool: any) {
            const toolName = typeof tool === 'string' ? tool : tool.name

            // Always check if already registered first
            if ((window as any)._mailopolyRegisteredTools.has(toolName)) {
              console.warn(`[MCP-B] Tool ${toolName} already registered, suppressing duplicate`)
              // Return mock object - no error thrown
              return {
                name: toolName,
                unregister: () => {}
              }
            }

            // Try to register, but catch any errors
            try {
              (window as any)._mailopolyRegisteredTools.add(toolName)
              const result = proto._originalRegisterTool.apply(this, arguments)
              return result
            } catch (error: any) {
              // Remove from tracking if registration failed
              (window as any)._mailopolyRegisteredTools.delete(toolName)

              // For duplicate errors, return mock object instead of throwing
              if (error.message && error.message.includes('Duplicate tool name')) {
                console.warn(`[MCP-B] Suppressed duplicate tool error for ${toolName}`)
                (window as any)._mailopolyRegisteredTools.add(toolName) // Re-add to prevent future attempts
                return {
                  name: toolName,
                  unregister: () => {}
                }
              }

              // For other errors, still throw them
              throw error
            }
          }
        }

        console.log('✅ MCP-B ModelContext prototype patched successfully')
        return true
      }

      // Fallback: try to patch nav.modelContext instance
      const nav = (window as any).nav
      if (nav?.modelContext) {
        const mc = nav.modelContext

        // Add missing unregisterTool method
        if (!mc.unregisterTool) {
          mc.unregisterTool = () => {
            // No-op - MCP-B doesn't support unregistering
          }
        }

        // Track registered tools globally to prevent duplicates
        if (!mc._mailopolyRegisteredTools) {
          mc._mailopolyRegisteredTools = new Set<string>()
        }

        // Wrap registerTool to prevent duplicates - be more aggressive
        if (!mc._originalRegisterTool) {
          mc._originalRegisterTool = mc.registerTool

          mc.registerTool = function(name: string, ...args: any[]) {
            // Always check if already registered first
            if (mc._mailopolyRegisteredTools.has(name)) {
              // Silently return mock object - no error thrown
              return {
                name,
                unregister: () => {}
              }
            }

            // Try to register, but catch any errors
            try {
              mc._mailopolyRegisteredTools.add(name)
              const result = mc._originalRegisterTool.apply(this, [name, ...args])
              return result
            } catch (error: any) {
              // Remove from tracking if registration failed
              mc._mailopolyRegisteredTools.delete(name)

              // For duplicate errors, return mock object instead of throwing
              if (error.message && error.message.includes('Duplicate tool name')) {
                mc._mailopolyRegisteredTools.add(name) // Re-add to prevent future attempts
                return {
                  name,
                  unregister: () => {}
                }
              }

              // For other errors, still throw them
              throw error
            }
          }
        }

        console.log('✅ MCP-B nav.modelContext patched successfully')
        return true
      }

      patchAttempts++
      if (patchAttempts < maxPatchAttempts) {
        setTimeout(applyPatches, 100)
      } else {
        console.warn('⚠️ MCP-B library not found after 5 seconds, continuing without patches')
      }

      return false
    }

    // Add global error handlers to catch MCP-B errors
    const originalOnError = window.onerror
    const originalOnUnhandledRejection = window.onunhandledrejection

    window.onerror = function(message, source, lineno, colno, error) {
      // Suppress MCP-B related errors
      if (typeof message === 'string' &&
          (message.includes('unregisterTool is not a function') ||
           message.includes('Duplicate tool name') ||
           message.includes('InvalidStateError') ||
           message.includes('Failed to execute \'registerTool\''))) {
        return true // Prevent default error handling
      }

      // Call original handler if it exists
      if (originalOnError) {
        return originalOnError(message, source, lineno, colno, error)
      }
      return false
    }

    window.onunhandledrejection = function(event: PromiseRejectionEvent) {
      const reason = event.reason
      if (reason && typeof reason === 'string' &&
          (reason.includes('unregisterTool is not a function') ||
           reason.includes('Duplicate tool name') ||
           reason.includes('InvalidStateError') ||
           reason.includes('Failed to execute \'registerTool\''))) {
        event.preventDefault() // Prevent the error from being logged
        return
      }

      // Call original handler if it exists
      if (originalOnUnhandledRejection) {
        originalOnUnhandledRejection.call(window, event)
      }
    }

    // Start patching process
    applyPatches()
  }
}

// Initialize MCP-B setup immediately
setupMCPBPatching()

// Custom hook to wrap useWebMCP - passes through with global error handling
function useSafeWebMCP(config: Parameters<typeof useWebMCP>[0], deps: Parameters<typeof useWebMCP>[1]) {
  useWebMCP(config, deps)
}

// Custom hook to wrap useWebMCPContext and handle MCP-B library bugs
function useSafeWebMCPContext(name: string, description: string, data: any) {
  useWebMCPContext(name, description, data)
}

function MailopolyMCPTools() {
  const { executeCommand } = useUICommand()
  const emailCtx = useEmailFilter()
  const { openChat, closeChat } = usePolyChat()
  const { fuse, fetchSendersIfNeeded } = useSenders()

  // useCallback must be called unconditionally to maintain hook order
  const emailFiltersCallback = useCallback(() => ({
    searchTerm: emailCtx.filters.searchTerm ?? '',
    emailType: emailCtx.filters.emailType,
    timeRange: emailCtx.filters.timeRange,
    personalOrAd: emailCtx.filters.personalOrAd,
    segment: emailCtx.filters.segment,
    accounts: emailCtx.filters.accounts,
    threaded: emailCtx.filters.threaded ?? false,
  }), [emailCtx])

  // ──────────────────────────────────────────────
  // TOOL: search_emails
  // Search and filter the inbox
  // ──────────────────────────────────────────────
  useSafeWebMCP({
    name: 'search_emails',
    description:
      'Search and filter emails in the Mailopoly inbox. Supports text search, ' +
      'folder selection, time range, and personal vs advertising split.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Free-text search query to match against email subject, sender, or body' },
        emailType: {
          type: 'string',
          enum: ['inbox', 'sent', 'drafts', 'spam', 'deleted'],
          description: 'Which folder to view'
        },
        timeRange: {
          type: 'string',
          enum: ['today', 'yesterday', 'this_week', 'last_week', 'this_month', 'last_month', 'this_year', 'all'],
          description: 'Limit results to this time window'
        },
        personalOrAd: {
          type: 'string',
          enum: ['personal', 'advertising'],
          description: 'Filter to personal emails only or advertising/newsletters only'
        },
        segment: { type: 'string', description: 'Filter by email category/segment' },
      },
    } as const satisfies JsonSchemaForInference,
    handler: async (args) => {
      await executeCommand({
        type: 'multi_filter',
        payload: {
          search: args.query,
          emailType: args.emailType,
          timeRange: args.timeRange,
          personalOrAd: args.personalOrAd,
          segment: args.segment,
        },
      })
      return { success: true, applied: args }
    },
  }, [executeCommand])

  // ──────────────────────────────────────────────
  // TOOL: set_inbox_preset
  // Quick inbox presets (cleanbox / all / sent / advertising)
  // ──────────────────────────────────────────────
  useSafeWebMCP({
    name: 'set_inbox_preset',
    description:
      'Switch to inbox to a quick preset view: ' +
      '"cleanbox" (personal only), "advertising" (newsletters), ' +
      '"all" (everything), or "sent" (sent mail).',
    inputSchema: {
      type: 'object',
      properties: {
        preset: {
          type: 'string',
          enum: ['cleanbox', 'advertising', 'all', 'sent'],
          description: 'Inbox preset to activate'
        },
      },
      required: ['preset'],
    } as const satisfies JsonSchemaForInference,
    handler: async (args) => {
      await executeCommand({
        type: 'set_email_filter' as any,
        payload: { filter: args.preset },
      })
      return { success: true, preset: args.preset }
    },
  }, [executeCommand])

  // ──────────────────────────────────────────────
  // TOOL: set_time_range
  // Filter emails by time window
  // ──────────────────────────────────────────────
  useSafeWebMCP({
    name: 'set_time_range',
    description: 'Filter email inbox to show only emails from a specific time period.',
    inputSchema: {
      type: 'object',
      properties: {
        timeframe: {
          type: 'string',
          enum: ['today', 'yesterday', 'this_week', 'last_week', 'this_month', 'last_month', 'this_year', 'all'],
          description: 'Time period to filter by'
        },
      },
      required: ['timeframe'],
    } as const satisfies JsonSchemaForInference,
    handler: async (args) => {
      await executeCommand({
        type: 'set_time_range' as any,
        payload: { timeframe: args.timeframe },
      })
      return { success: true, timeframe: args.timeframe }
    },
  }, [executeCommand])

  // ──────────────────────────────────────────────
  // TOOL: clear_email_filters
  // Reset all active filters
  // ──────────────────────────────────────────────
  useSafeWebMCP({
    name: 'clear_email_filters',
    description: 'Reset all email filters and search terms, returning to inbox to its default view.',
    inputSchema: {
      type: 'object',
      properties: {},
    } as const satisfies JsonSchemaForInference,
    handler: async () => {
      emailCtx.clearFilters()
      return { success: true }
    },
  }, [emailCtx])

  // ──────────────────────────────────────────────
  // TOOL: compose_email
  // Open compose window with optional pre-fill
  // ──────────────────────────────────────────────
  useSafeWebMCP({
    name: 'compose_email',
    description:
      'Open email compose window. Optionally pre-fill a recipient, subject, and body. ' +
      'The user can review and edit before sending.',
    inputSchema: {
      type: 'object',
      properties: {
        to: { type: 'string', description: 'Recipient email address or name' },
        subject: { type: 'string', description: 'Email subject line' },
        body: { type: 'string', description: 'Email body (plain text or HTML)' },
      },
    } as const satisfies JsonSchemaForInference,
    handler: async (args) => {
      await executeCommand({ type: 'compose_email', payload: args })
      return { success: true, prefilled: args }
    },
  }, [executeCommand])

  // ──────────────────────────────────────────────
  // TOOL: navigate_to
  // Navigate between app sections
  // ──────────────────────────────────────────────
  useSafeWebMCP({
    name: 'navigate_to',
    description: 'Navigate to a different section of Mailopoly app.',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          enum: ['/inbox', '/drafts', '/tasks', '/calendar', '/outreach', '/profile'],
          description: 'App route to navigate to'
        },
      },
      required: ['path'],
    } as const satisfies JsonSchemaForInference,
    handler: async (args) => {
      await executeCommand({ type: 'navigate', payload: { path: args.path } })
      return { success: true, navigatedTo: args.path }
    },
  }, [executeCommand])

  // ──────────────────────────────────────────────
  // TOOL: open_email
  // Select and open a specific email by ID
  // ──────────────────────────────────────────────
  useSafeWebMCP({
    name: 'open_email',
    description: 'Select and open a specific email by its ID to view its full content.',
    inputSchema: {
      type: 'object',
      properties: {
        emailId: { type: 'string', description: 'The unique ID of email to open' },
      },
      required: ['emailId'],
    } as const satisfies JsonSchemaForInference,
    handler: async (args) => {
      await executeCommand({ type: 'select_email', payload: { emailId: args.emailId } })
      return { success: true, emailId: args.emailId }
    },
  }, [executeCommand])

  // ──────────────────────────────────────────────
  // TOOL: reply_to_email
  // Open reply window for a specific email
  // ──────────────────────────────────────────────
  useSafeWebMCP({
    name: 'reply_to_email',
    description: 'Open a reply or reply-all compose window for a specific email.',
    inputSchema: {
      type: 'object',
      properties: {
        emailId: { type: 'string', description: 'The ID of email to reply to' },
        replyType: {
          type: 'string',
          enum: ['reply', 'reply-all'],
          default: 'reply',
          description: 'Whether to reply to sender only or all recipients'
        },
      },
      required: ['emailId'],
    } as const satisfies JsonSchemaForInference,
    handler: async (args) => {
      await executeCommand({
        type: 'reply_email',
        payload: { emailId: args.emailId, replyType: args.replyType },
      })
      return { success: true }
    },
  }, [executeCommand])

  // ──────────────────────────────────────────────
  // TOOL: show_source_emails
  // Pin specific emails to the top of the list by ID
  // ──────────────────────────────────────────────
  useSafeWebMCP({
    name: 'show_source_emails',
    description:
      'Highlight and display a specific set of emails by their IDs — useful for ' +
      'surfacing AI-identified relevant emails to user.',
    inputSchema: {
      type: 'object',
      properties: {
        emailIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of email IDs to highlight in inbox'
        },
      },
      required: ['emailIds'],
    } as const satisfies JsonSchemaForInference,
    handler: async (args) => {
      await executeCommand({
        type: 'source_filter',
        payload: { emailIds: args.emailIds },
      })
      return { success: true, count: args.emailIds.length }
    },
  }, [executeCommand])

  // ──────────────────────────────────────────────
  // TOOL: lookup_sender
  // Fuzzy-search contacts/senders
  // ──────────────────────────────────────────────
  useSafeWebMCP({
    name: 'lookup_sender',
    description:
      'Fuzzy-search contacts list by name or email address. ' +
      'Returns up to 5 matching senders.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Name or email address fragment to search for' },
      },
      required: ['query'],
    } as const satisfies JsonSchemaForInference,
    handler: async (args) => {
      await fetchSendersIfNeeded()
      const results = fuse
        .search(args.query)
        .slice(0, 5)
        .map((r) => ({
          name: r.item.senders_name,
          email: r.item.senders_email,
          displayName: r.item.senders_display_name,
        }))
      return { results, count: results.length }
    },
  }, [fuse, fetchSendersIfNeeded])

  // ──────────────────────────────────────────────
  // TOOL: toggle_poly_chat
  // Open/close to Poly AI assistant
  // ──────────────────────────────────────────────
  useSafeWebMCP({
    name: 'toggle_poly_chat',
    description:
      'Open or close to Poly AI assistant chat panel. ' +
      'When opening, optionally specify display mode and which tab to show.',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['open', 'close'],
          description: 'Open or close chat panel'
        },
        view: {
          type: 'string',
          enum: ['sidebar', 'panel', 'fullscreen', 'drawer'],
          description: 'How to display chat panel when opening'
        },
        tab: {
          type: 'string',
          enum: ['chat', 'email', 'secure'],
          description: 'Which tab to show inside the chat panel'
        },
      },
      required: ['action'],
    } as const satisfies JsonSchemaForInference,
    handler: async (args) => {
      if (args.action === 'close') {
        closeChat()
      } else {
        openChat(args.view, args.tab)
      }
      return { success: true, action: args.action }
    },
  }, [openChat, closeChat])

  // ──────────────────────────────────────────────
  // CONTEXT: current_email_filters
  // Exposes live filter state to the AI agent (read-only)
  // ──────────────────────────────────────────────
  useSafeWebMCPContext(
    'current_email_filters',
    'The active search and filter state of email inbox — lets AI know what user is currently viewing.',
    emailFiltersCallback
  )

  return null
}

// Global flag to prevent duplicate component mounting
// Global registry to track registered tools and prevent duplicates
const registeredTools = new Set<string>()

// Component that only renders once to prevent duplicate MCP-B tool registration
const MailopolyMCPToolsSingleton = () => {
  const [shouldRender, setShouldRender] = useState(false)

  React.useEffect(() => {
    // Check if tools are already registered by looking at the global registry
    const toolNames = [
      'get_emails',
      'send_email',
      'search_emails',
      'get_email_details',
      'delete_email',
      'mark_email_read',
      'create_draft',
      'get_drafts',
      'get_senders',
      'filter_emails'
    ]

    const alreadyRegistered = toolNames.some(name => registeredTools.has(name))

    if (!alreadyRegistered) {
      // Mark tools as registered
      toolNames.forEach(name => registeredTools.add(name))
      setShouldRender(true)
    }
    // If already registered, don't render (component returns null)
  }, [])

  if (!shouldRender) {
    return null
  }

  return (
    <MCPErrorBoundary>
      <MailopolyMCPTools />
    </MCPErrorBoundary>
  )
}

export { MailopolyMCPToolsSingleton as MailopolyMCPTools }