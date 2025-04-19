# Kora Financial Health Platform: Development Context

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Project Vision](#project-vision)
3. [System Architecture](#system-architecture)
4. [Component Breakdown](#component-breakdown)
5. [Technical Stack](#technical-stack)
6. [Development Roadmap](#development-roadmap)
7. [Data Privacy & Security](#data-privacy--security)
8. [Development Standards](#development-standards)
9. [Key Challenges](#key-challenges)
10. [Future Considerations](#future-considerations)

## Executive Summary

Kora is a comprehensive financial health platform that combines AI-powered personal finance management with macroeconomic impact analysis. The platform helps users understand and control their financial lives while generating valuable economic insights through anonymized data aggregation.

The platform features:
- Context-aware AI financial companion
- Multi-method transaction capture system
- Comprehensive account integration
- Privacy-preserving data architecture
- Receipt processing with SKU matching
- Social features for friends and family
- Fraud prevention mechanisms
- Personalized financial insights

The development approach follows a modular, block-based architecture with a phased implementation strategy, starting with core authentication and gradually adding more sophisticated features.

## Project Vision

### Core Concept
Kora reimagines personal financial management by creating an AI-powered companion that understands the complete context of users' financial lives. Unlike traditional financial tools that focus solely on transactions and numbers, Kora aims to understand why financial decisions are made and how they fit into users' broader life context.

### Key Differentiators
- **Context Understanding**: Kora analyzes not just what users spend on, but why they make specific financial choices
- **Privacy-First Architecture**: Two-tier system with sensitive data processing on device
- **Comprehensive Integration**: Unified view of all financial instruments and accounts
- **Social Dimension**: Recognition that financial decisions often involve family and friends
- **Economic Insights**: Aggregated, anonymized data provides valuable macroeconomic indicators

### User Value Proposition
Kora serves as a personal financial companion that:
- Helps users make better financial decisions
- Provides context-aware financial advice
- Simplifies tracking and managing finances
- Protects users from fraud and scams
- Creates value through optimization and deal finding

## System Architecture

### Overall Architecture
Kora implements a hybrid microservices architecture with strategic use of serverless computing:

- **Core Services**: Modular, independent services handling specific functions
- **Edge Computing**: Local processing of sensitive data on user devices
- **Cloud Backend**: Centralized system for anonymized data and shared services
- **Real-time Communication**: WebSocket connections for instant updates

### Data Flow Architecture
1. User data is captured through multiple input methods (bank connections, receipt scanning, manual entry)
2. Sensitive context and personal data is processed locally on device
3. Anonymized data is sent to cloud services for aggregation and analysis
4. Insights are generated and sent back to user devices
5. Continuous learning improves personalization through privacy-preserving feedback

### Privacy Architecture
The platform implements a two-tier data system:
- **Local System (Private Vault)**: Runs on user device, manages sensitive data
- **Server System (Public Library)**: Receives only anonymized data

## Component Breakdown

### Block 1: User Authentication & Profile System
This component serves as the foundation for user identity management, security, and contextual data collection.

**Core Features**:
- User registration and authentication
- Multi-factor authentication
- Profile management
- Financial context collection
- Security implementation
- Session handling

**Database Schema**:
```sql
-- Key tables (simplified)
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    country_residence VARCHAR(2) NOT NULL,
    country_citizenship VARCHAR(2) NOT NULL,
    age INTEGER NOT NULL,
    household_income_bracket VARCHAR(20),
    household_role VARCHAR(50),
    race VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE employment_info (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    employment_status VARCHAR(50) NOT NULL,
    company_name VARCHAR(255),
    job_title VARCHAR(255),
    industry VARCHAR(100),
    employment_duration INTEGER,
    income_structure VARCHAR(50),
    pay_frequency VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Implementation with Supabase**:
```javascript
// User registration example
async function registerUser(userData) {
  try {
    // Register user in Supabase Auth
    const { user, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      phone: userData.phoneNumber
    });
    
    if (authError) throw authError;
    
    // Create profile in database
    const { data, error: dbError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: userData.email,
        phone_number: userData.phoneNumber,
        first_name: userData.firstName,
        last_name: userData.lastName,
        country_residence: userData.countryResidence,
        country_citizenship: userData.countryCitizenship,
        age: userData.age,
        household_income_bracket: userData.householdIncomeBracket,
        household_role: userData.householdRole,
        race: userData.race
      });
    
    if (dbError) throw dbError;
    
    return { user, profile: data };
  } catch (error) {
    console.error('Error during registration:', error);
    throw error;
  }
}
```

### Block 2: Financial Account Integration
This component enables secure connection and monitoring of users' financial accounts through Plaid integration.

**Core Features**:
- Plaid integration for bank account connection
- Credit card account monitoring
- Balance tracking
- Credit score access
- Real-time updates
- Secure token management

**Database Schema**:
```sql
-- Key tables (simplified)
CREATE TABLE financial_accounts (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    plaid_account_id VARCHAR(100),
    account_type VARCHAR(50),
    account_name VARCHAR(255),
    institution_name VARCHAR(255),
    last_four VARCHAR(4),
    current_balance DECIMAL(19,4),
    available_balance DECIMAL(19,4),
    currency_code VARCHAR(3),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE account_balances (
    id UUID PRIMARY KEY,
    account_id UUID REFERENCES financial_accounts(id),
    balance_amount DECIMAL(19,4),
    available_amount DECIMAL(19,4),
    timestamp TIMESTAMP,
    is_current BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Implementation with Supabase**:
```javascript
// Store Plaid account connection
async function storePlaidAccount(userId, plaidAccount) {
  try {
    const { data, error } = await supabase
      .from('financial_accounts')
      .insert({
        user_id: userId,
        plaid_account_id: plaidAccount.id,
        account_type: plaidAccount.type,
        account_name: plaidAccount.name,
        institution_name: plaidAccount.institution,
        last_four: plaidAccount.mask,
        current_balance: plaidAccount.balances.current,
        available_balance: plaidAccount.balances.available,
        currency_code: plaidAccount.balances.iso_currency_code
      });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error storing account:', error);
    throw error;
  }
}
```

### Block 3: Transaction Management System
This component handles the processing, categorization, and analysis of financial transactions across user accounts.

**Core Features**:
- Transaction data collection
- Automated categorization
- Pattern recognition
- Recurring payment detection
- Search and filtering
- Data aggregation

**Database Schema**:
```sql
-- Key tables (simplified)
CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    account_id UUID REFERENCES financial_accounts(id),
    user_id UUID REFERENCES users(id),
    amount DECIMAL(19,4) NOT NULL,
    currency_code VARCHAR(3) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    merchant_name VARCHAR(255),
    merchant_category VARCHAR(100),
    transaction_date TIMESTAMP NOT NULL,
    posted_date TIMESTAMP,
    location JSONB,
    payment_channel VARCHAR(50),
    pending BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transaction_metadata (
    transaction_id UUID PRIMARY KEY REFERENCES transactions(id),
    category_confidence FLOAT,
    recurring_flag BOOLEAN,
    recurring_details JSONB,
    custom_category VARCHAR(100),
    tags TEXT[],
    notes TEXT,
    internal_category_id UUID,
    user_modified BOOLEAN DEFAULT false
);
```

**Implementation with Supabase and Real-time Updates**:
```javascript
// Subscribe to new transactions
function subscribeToTransactions(userId, callback) {
  const subscription = supabase
    .from('transactions')
    .on('INSERT', payload => {
      if (payload.new.user_id === userId) {
        callback(payload.new);
      }
    })
    .subscribe();
    
  return subscription;
}
```

### Block 4: Receipt Processing System
This component handles the capture, analysis, and data extraction from receipts through multiple input methods.

**Core Features**:
- Camera integration for receipt scanning
- Share extension integration
- Email receipt processing
- OCR implementation
- SKU matching system
- Data processing pipeline

**Database Schema**:
```sql
-- Key tables (simplified)
CREATE TABLE receipts (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    merchant_id UUID,
    transaction_date TIMESTAMP,
    total_amount DECIMAL(19,4),
    tax_amount DECIMAL(19,4),
    payment_method VARCHAR(50),
    status VARCHAR(50),
    verification_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE receipt_items (
    id UUID PRIMARY KEY,
    receipt_id UUID REFERENCES receipts(id),
    sku VARCHAR(100),
    product_id UUID,
    quantity INTEGER,
    unit_price DECIMAL(19,4),
    total_price DECIMAL(19,4),
    discount_amount DECIMAL(19,4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Implementation with Supabase Storage**:
```javascript
// Store receipt image and processed data
async function processAndStoreReceipt(userId, receiptImage, receiptData) {
  try {
    // Upload image to Supabase Storage
    const imagePath = `receipts/${userId}/${Date.now()}.jpg`;
    const { data: fileData, error: fileError } = await supabase
      .storage
      .from('receipts')
      .upload(imagePath, receiptImage);
    
    if (fileError) throw fileError;
    
    // Store receipt data in database
    const { data: receiptRecord, error: receiptError } = await supabase
      .from('receipts')
      .insert({
        user_id: userId,
        merchant_id: receiptData.merchantId,
        transaction_date: receiptData.date,
        total_amount: receiptData.totalAmount,
        tax_amount: receiptData.taxAmount,
        payment_method: receiptData.paymentMethod,
        status: 'processed',
        verification_status: 'pending',
        image_path: imagePath
      });
    
    if (receiptError) throw receiptError;
    
    // Store receipt line items
    const receiptItems = receiptData.items.map(item => ({
      receipt_id: receiptRecord[0].id,
      sku: item.sku,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.totalPrice,
      discount_amount: item.discountAmount
    }));
    
    const { data: itemsData, error: itemsError } = await supabase
      .from('receipt_items')
      .insert(receiptItems);
    
    if (itemsError) throw itemsError;
    
    return { receipt: receiptRecord[0], items: itemsData };
  } catch (error) {
    console.error('Error processing receipt:', error);
    throw error;
  }
}
```

### Block 5: Dashboard & Analytics System
This component serves as the primary interface for users to understand their financial health.

**Core Features**:
- Financial overview dashboard
- Transaction analytics
- Budget tracking
- Insight generation
- Visualization components
- Export capabilities

**Database Schema**:
```sql
-- Key tables (simplified)
CREATE TABLE financial_snapshots (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    net_worth DECIMAL(19,4),
    total_assets DECIMAL(19,4),
    total_liabilities DECIMAL(19,4),
    credit_score INTEGER,
    cash_flow_monthly DECIMAL(19,4),
    snapshot_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE financial_insights (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    insight_type VARCHAR(50),
    priority INTEGER,
    title VARCHAR(255),
    description TEXT,
    action_items JSONB,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Implementation with Supabase Functions**:
```javascript
// Generate financial insights
async function generateInsights(userId) {
  try {
    // This would typically be handled by a scheduled function
    // For simplicity, we're showing a direct implementation
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('transaction_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    
    if (txError) throw txError;
    
    // Apply analysis algorithms to transactions
    const insights = analyzeTransactions(transactions);
    
    // Store insights
    const { data, error } = await supabase
      .from('financial_insights')
      .insert(insights.map(insight => ({
        user_id: userId,
        insight_type: insight.type,
        priority: insight.priority,
        title: insight.title,
        description: insight.description,
        action_items: insight.actionItems,
        expires_at: insight.expiresAt
      })));
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error generating insights:', error);
    throw error;
  }
}
```

## Technical Stack

### Frontend Development
- **Framework**: React Native with TypeScript
- **State Management**: Redux/Zustand
- **UI Components**: Custom component library with Tailwind CSS
- **Data Visualization**: D3.js and Recharts
- **Testing**: Jest and React Native Testing Library

### Backend Development
- **Platform**: Supabase for backend services
- **Database**: PostgreSQL (managed through Supabase)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (S3-compatible)
- **Functions**: Supabase Edge Functions (serverless)
- **Real-time**: Supabase Realtime for live updates

### Third-Party Services
- **Financial Connections**: Plaid API
- **Receipt Processing**: Google Cloud Vision
- **AI/ML Processing**: TensorFlow/PyTorch models served via API

### DevOps
- **CI/CD**: GitHub Actions for automation
- **Containerization**: Docker
- **Infrastructure as Code**: Terraform (for custom infrastructure beyond Supabase)

### Implementation Notes for Supabase

**Setting Up Supabase Client**:
```javascript
// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Authentication with Supabase**:
```javascript
// Sign up
const { user, error } = await supabase.auth.signUp({
  email: 'example@email.com',
  password: 'example-password',
  phone: '+1234567890'
});

// Sign in
const { user, error } = await supabase.auth.signIn({
  email: 'example@email.com',
  password: 'example-password'
});

// Sign out
const { error } = await supabase.auth.signOut();
```

**Database Operations**:
```javascript
// Insert data
const { data, error } = await supabase
  .from('table_name')
  .insert({ column: 'value' });

// Query data
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column', 'value');

// Update data
const { data, error } = await supabase
  .from('table_name')
  .update({ column: 'new_value' })
  .eq('id', 123);

// Delete data
const { data, error } = await supabase
  .from('table_name')
  .delete()
  .eq('id', 123);
```

**Real-time Subscriptions**:
```javascript
const subscription = supabase
  .from('table_name')
  .on('INSERT', payload => {
    console.log('New record:', payload.new);
  })
  .on('UPDATE', payload => {
    console.log('Updated record:', payload.new);
  })
  .on('DELETE', payload => {
    console.log('Deleted record:', payload.old);
  })
  .subscribe();
```

## Development Roadmap

### MVP Phase: Block 1 (1-2 months)
- Implement user authentication using Supabase Auth
- Create profile management system
- Set up basic security measures
- Develop mobile frontend for registration and login
- Implement session management

**Implementation Tasks**:
1. Set up Supabase project and database schema
2. Implement authentication screens (login, registration)
3. Create profile setup flow
4. Implement session management
5. Basic security implementation (MFA setup)

### Phase 2: Financial Integration (2-3 months)
- Integrate with Plaid for bank connections
- Implement transaction processing
- Create basic categorization system
- Develop account dashboard
- Set up real-time updates using Supabase Realtime

**Implementation Tasks**:
1. Set up Plaid integration
2. Create database tables for financial accounts and transactions
3. Implement transaction synchronization
4. Develop basic transaction categorization system
5. Create account dashboard views

### Phase 3: Enhanced Features (3-4 months)
- Implement receipt processing
- Develop more sophisticated AI insights
- Add social features
- Enhance security measures
- Improve user interface

**Implementation Tasks**:
1. Develop receipt scanning and OCR integration
2. Create receipt processing pipeline
3. Implement social connections and sharing
4. Advanced security implementation
5. UI/UX improvements

### Phase 4: Full Platform (4-6 months)
- Complete all core components
- Implement advanced analytics
- Integrate merchant partnerships
- Develop economic insights
- Optimize performance and scale

**Implementation Tasks**:
1. Develop advanced analytics systems
2. Implement merchant integration
3. Create economic insight generation
4. Optimize performance and scale
5. Comprehensive testing and refinement

## Data Privacy & Security

### Privacy Architecture
- **Local Processing**: Sensitive data processed on device
- **Data Minimization**: Only necessary data sent to servers
- **Anonymization**: Personal identifiers removed from aggregated data
- **User Control**: Granular privacy settings
- **Encryption**: End-to-end encryption for all sensitive data

### Security Implementation with Supabase
- **Authentication**: Supabase Auth with MFA support
- **Authorization**: Row-level security policies in PostgreSQL
- **Data Protection**: Encryption at rest and in transit
- **API Security**: JWTs for authentication and authorization
- **Monitoring**: Supabase logging and monitoring

**Row-Level Security Example**:
```sql
-- Only allow users to see their own data
CREATE POLICY "Users can only view their own data" 
ON "public"."users" FOR SELECT 
USING (auth.uid() = id);

-- Only allow users to update their own data
CREATE POLICY "Users can only update their own data" 
ON "public"."users" FOR UPDATE 
USING (auth.uid() = id);
```

### Fraud Prevention
- **Identity Verification**: Multi-factor authentication, behavioral analysis
- **Transaction Security**: Pattern analysis, risk assessment
- **Scam Prevention**: AI-powered analysis, trusted contact network
- **Emergency Protocols**: Secure verification channels, behavioral matching

## Development Standards

### Code Quality
- **Style Guide**: ESLint with Airbnb configuration for JavaScript/TypeScript
- **Formatting**: Prettier for consistent code formatting
- **Type Safety**: TypeScript with strict mode enabled
- **Documentation**: JSDoc for functions, component props documented

### Testing Requirements
- **Unit Testing**: Jest for both frontend and backend
- **Component Testing**: React Testing Library
- **API Testing**: Supertest for endpoint verification
- **Integration Testing**: Critical user flows tested end-to-end
- **Coverage**: Minimum 80% code coverage

### Git Workflow
- **Branching**: Feature branching from development
- **Pull Requests**: Required code review before merge
- **CI**: Automated tests on pull requests
- **Versioning**: Semantic versioning
- **Releases**: Tagged releases with changelogs

### Documentation
- **API**: OpenAPI/Swagger documentation
- **Architecture**: Decision records for significant choices
- **Components**: Storybook for UI components
- **Setup**: Clear instructions for development environment

## Key Challenges

### Technical Complexities
- **Data Integration**: Handling various financial data sources
- **Real-time Processing**: Managing high-volume transaction data
- **AI Accuracy**: Ensuring relevant and accurate insights
- **Privacy-Performance Balance**: Edge computing vs. cloud processing
- **Scale**: Handling growth in users and transaction volume

### Privacy Challenges
- **Data Minimization**: Balancing analytics needs with privacy
- **Local Processing**: Implementing efficient on-device processing
- **Anonymization**: Ensuring data cannot be re-identified
- **User Control**: Creating intuitive privacy controls
- **Regulatory Compliance**: Meeting various global requirements

### UX Challenges
- **Complexity Management**: Presenting comprehensive data simply
- **Onboarding**: Simplifying account connection process
- **Trust Building**: Earning user confidence with financial data
- **Feature Discovery**: Making advanced capabilities discoverable
- **Cross-Platform Consistency**: Ensuring quality across devices

## Future Considerations

### Scalability Planning
- **Database Sharding**: Strategy for horizontal scaling beyond Supabase
- **Microservice Evolution**: Refining service boundaries
- **Global Expansion**: Multi-region deployment
- **Performance Optimization**: Caching and computation strategies
- **Load Testing**: Simulating high-traffic scenarios

### Feature Extensions
- **Advanced AI**: More sophisticated financial insights
- **Merchant Integration**: Direct connections with retailers
- **Payment Capabilities**: Integration with payment systems
- **Investment Analysis**: Advanced portfolio management
- **International Support**: Multiple currencies and regulations

### Integration Ecosystem
- **API Platform**: Developer ecosystem for third-party integration
- **Financial Institution Partnerships**: Direct data sharing
- **Enterprise Solutions**: Business-focused offerings
- **Economic Research**: Academic and policy partnerships
- **Open Banking**: Compliance with emerging standards