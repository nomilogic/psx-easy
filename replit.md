# Pakistan Stock Exchange (PSX) Dashboard

## Overview

This is a full-stack web application that provides real-time Pakistan Stock Exchange (PSX) market data through a React frontend and Express.js backend. The application features live stock tickers, market summaries, WebSocket real-time updates, and a comprehensive API for financial data.

**Status**: ✅ Fully functional with PostgreSQL database persistence, live PSX data, sorting, search, and navigation features
**Last Updated**: January 27, 2025

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure with clearly separated frontend and backend concerns:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom color variables and themes
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Real-time**: WebSocket integration for live market updates

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Real-time**: WebSocket server for live data streaming
- **External Data**: PSX service for scraping stock market data
- **Storage**: PostgreSQL database persistence with Drizzle ORM and type-safe database operations

## Key Components

### Data Layer
- **Drizzle ORM**: Type-safe database operations with PostgreSQL
- **Storage Interface**: Abstraction layer supporting both memory and database storage
- **PSX Service**: External service integration for market data scraping
- **Schema Validation**: Shared TypeScript interfaces for type safety

### API Layer
- **RESTful Endpoints**: Market overview, stocks, sectors, and system status
- **WebSocket Server**: Real-time data broadcasting to connected clients
- **Error Handling**: Centralized error middleware with proper status codes
- **Request Logging**: Detailed API call tracking and performance monitoring

### Frontend Components
- **Market Overview**: Dashboard displaying market summary statistics
- **Live Stock Ticker**: Real-time stock price updates with instant search and sortable columns
- **Stock Detail Pages**: Individual stock pages with comprehensive company information
- **API Documentation**: Interactive documentation with endpoint testing
- **WebSocket Info**: Connection status and real-time data management

## Data Flow

1. **External Data Ingestion**: PSX service scrapes market data from external sources
2. **Data Processing**: Raw data is normalized and stored using the storage interface
3. **API Distribution**: RESTful endpoints serve processed data to clients
4. **Real-time Updates**: WebSocket server broadcasts live updates to connected clients
5. **Frontend Consumption**: React components consume both REST and WebSocket data
6. **State Management**: TanStack Query manages server state with caching and synchronization

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, TanStack Query
- **Backend Runtime**: Express.js, Node.js with TypeScript support
- **Database**: Drizzle ORM, Neon Database serverless PostgreSQL
- **WebSocket**: ws library for server-side WebSocket implementation

### UI and Styling
- **Component Library**: Radix UI primitives for accessible components
- **Design System**: shadcn/ui components built on Radix UI
- **Styling**: Tailwind CSS with PostCSS for processing
- **Icons**: Lucide React for consistent iconography

### Development Tools
- **Build Tools**: Vite for frontend, esbuild for backend bundling
- **Type Safety**: TypeScript across the entire stack
- **Code Quality**: ESLint and other development utilities
- **Replit Integration**: Special Replit plugins for development environment

### External Services
- **Data Source**: Pakistan Stock Exchange (PSX) data scraping
- **Database Hosting**: Neon Database for serverless PostgreSQL
- **WebSocket Communication**: Real-time bidirectional client-server communication

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with HMR for frontend
- **Backend Development**: tsx for TypeScript execution with hot reload
- **Database**: Drizzle migrations with push commands for schema updates
- **Environment Variables**: DATABASE_URL for database connection

### Production Build
- **Frontend Build**: Vite production build with optimizations
- **Backend Build**: esbuild bundle for Node.js deployment
- **Static Assets**: Frontend assets served by Express in production
- **Database**: Production PostgreSQL with Drizzle ORM migrations

### Architecture Decisions

**Monorepo Structure**: Chosen for simplified development and deployment while maintaining clear separation between frontend (`client/`), backend (`server/`), and shared code (`shared/`).

**Drizzle ORM**: Selected for type-safe database operations and excellent TypeScript integration, providing better developer experience compared to traditional ORMs.

**Database-First Storage Pattern**: Implemented PostgreSQL database persistence with Drizzle ORM for type-safe operations and data integrity across all environments.

**WebSocket + REST Hybrid**: REST APIs provide initial data loading and fallback, while WebSockets handle real-time updates for optimal user experience.

**TanStack Query**: Chosen for sophisticated caching, background updates, and optimistic updates, reducing server load and improving user experience.

**Radix UI + shadcn/ui**: Provides accessible, unstyled components with a consistent design system, ensuring both accessibility and customization flexibility.

### Recent Updates (January 27, 2025)
- **Enhanced Search**: Added instant search functionality that filters stocks as you type
- **Sortable Columns**: All table columns (symbol, name, price, high, low, change, volume) are now sortable
- **Clickable Rows**: Stock table rows navigate to individual stock detail pages
- **Stock Detail Pages**: Complete company information pages with financial metrics, key people, and announcements
- **High/Low Columns**: Added visual High and Low price columns with color coding
- **Improved Navigation**: Seamless navigation between dashboard and stock details using wouter routing