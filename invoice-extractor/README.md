# 📄 Invoice Extractor
 Processing Application

A full-stack application that extracts structured data from invoice documents and creates database records dynamically.

## 🎯 Case Study Implementation

This project demonstrates:
- **Document Processing**: Automated invoice data extraction using simulated LLM processing
- **Full-Stack Architecture**: React/Next.js frontend with Flask backend
- **Database Integration**: SQLite database with dynamic data creation
- **Real-time Processing**: Live document upload and processing workflow
- **Clean Architecture**: Starts with empty database, creates data on-demand

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Next.js)     │◄──►│    (Flask)      │◄──►│   (SQLite)      │
│   Port: 3000    │    │   Port: 5001    │    │   Local File    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                         │
         │                       │                         │
    ┌────▼────┐             ┌────▼──────┐             ┌────▼────┐
    │ Upload  │             │  Document │             │Dynamic  │
    │Interface│             │ Processing│             │ Data    │
    │Data View│             │  Swagger  │             │Creation │
    │ History │             │    API    │             │On-Demand│
    └─────────┘             └───────────┘             └─────────┘
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+ 
- npm or yarn

### One-Command Setup

1. **Clone and run**
   ```bash
   git clone <repository-url>
   cd invoice-extractor
   ./run.sh
   ```

That's it! The script will:
- Check and install all dependencies
- Start both Flask backend (port 5001) and Next.js frontend (port 3000)
- Display status and access URLs

### Manual Setup (Alternative)

1. **Setup Backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python app.py
   ```

2. **Setup Frontend** (in new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **API Documentation**: http://localhost:5001/api-docs/

## 📊 Database Structure

The application uses a dynamic SQLite database that starts empty and creates data on-demand:

### Dynamic Tables
- **Products**: Created when invoices are processed (auto-generated IDs and product numbers)
- **Customers**: Created when new customer data is encountered
- **Sales Orders**: Created when invoices are saved to database
- **Order Details**: Line items linked to products and orders

### Key Features
- **Clean Start**: Database begins completely empty
- **On-Demand Creation**: Products and customers created only when needed
- **Auto-Generated IDs**: System assigns unique IDs automatically
- **Referential Integrity**: All relationships properly maintained
- **No Sample Data**: Only real processed invoice data is stored

## 🔧 Processing Workflow

1. **Document Upload**: User uploads invoice (PDF, JPG, PNG)
2. **Data Extraction**: System processes document and extracts:
   - Invoice metadata (dates, numbers, customer info)
   - Line items (products, quantities, prices)
   - Totals and tax calculations
3. **Data Validation**: System validates against database schema
4. **User Review**: Extracted data presented for editing/confirmation
5. **Database Storage**: Confirmed data saved to sales order tables

## 🔧 API Endpoints

### Invoice Processing
- `POST /api/invoices/upload` - Upload and process invoice
- `POST /api/invoices/save` - Save extracted data to database
- `GET /api/invoices/history` - Retrieve processed invoices
- `GET /api/invoices/{id}/details` - Get specific order details

### Data Access
- `GET /api/data/products` - Product catalog with search
- `GET /api/data/customers` - Customer directory
- `GET /api/data/categories` - Product categories
- `GET /api/data/territories` - Sales territories
- `GET /api/data/stats` - Database statistics

## 🎨 Frontend Features

### Upload Interface
- Drag-and-drop file upload
- Real-time processing status
- Progress indicators with step tracking
- File validation and error handling

### Data Review & Editing
- Interactive extracted data display
- Inline editing capabilities
- Automatic total recalculation
- Processing status display

### History & Analytics
- Processed invoice history
- Order detail exploration
- Revenue and order statistics
- Customer and product insights

### Database Explorer
- Product catalog browser
- Customer directory
- Territory information
- Search and filtering capabilities

## 🔍 Demo Instructions

### Testing the Application

1. **Start Both Servers**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm start
   
   # Terminal 2 - Frontend  
   cd frontend && npm run dev
   ```

2. **Upload Test Invoices**
   - Use provided sample invoice (Sales Invoice.png)
   - Create custom invoices using demo templates in `/demo-invoices/`
   - Test different formats (PDF, JPG, PNG)

3. **Explore Features**
   - Upload → Review extracted data → Edit if needed → Save to database
   - Visit History page to see processed orders
   - Explore Database page for underlying data structure
   - Check API documentation at `/api-docs`

### Sample Test Scenarios

1. **Basic Invoice Processing**
   - Upload the provided sample invoice
   - Review extracted data accuracy
   - Edit any incorrect fields
   - Save to database and verify in history

2. **Multiple Invoice Formats**
   - Test with different invoice templates
   - Compare extraction accuracy across formats
   - Demonstrate system adaptability

3. **Database Integration**
   - Show before/after database state
   - Explore product and customer data
   - Demonstrate data relationships

## 📈 Scaling Strategies

### Current Architecture (Development)
- Single-server deployment
- SQLite database
- Simulated processing
- Local file storage

### Production Scaling Recommendations

#### 1. **Microservices Architecture**
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Upload    │  │ Processing  │  │  Database   │
│  Service    │  │  Service    │  │  Service    │
└─────────────┘  └─────────────┘  └─────────────┘
       │                │                │
       └────────────────┼────────────────┘
                        │
              ┌─────────▼─────────┐
              │   Message Queue   │
              │   (Redis/RabbitMQ)│
              └───────────────────┘
```

#### 2. **Infrastructure Scaling**
- **Container Orchestration**: Docker + Kubernetes
- **Database**: PostgreSQL with read replicas
- **File Storage**: AWS S3 or Azure Blob Storage
- **CDN**: CloudFront for static assets
- **Load Balancing**: Application Load Balancer

#### 3. **Processing Optimization**
- **Batch Processing**: Queue system for high volume
- **Model Optimization**: Fine-tuned models for invoice formats
- **Caching**: Redis for frequently accessed data
- **Parallel Processing**: Multiple processing workers

#### 4. **Monitoring & Observability**
- **Metrics**: Prometheus + Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Tracing**: Jaeger for distributed tracing
- **Alerts**: PagerDuty integration

#### 5. **Security Enhancements**
- **Authentication**: OAuth 2.0 / JWT tokens
- **Authorization**: Role-based access control
- **Encryption**: TLS 1.3, data encryption at rest
- **Compliance**: SOC 2, GDPR compliance measures

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Fetch API
- **TypeScript**: Full type safety

### Backend
- **Framework**: Flask with SQLAlchemy
- **Documentation**: Swagger/Flasgger
- **Database**: SQLite with dynamic schema
- **File Upload**: Werkzeug secure uploads
- **Processing**: Simulated invoice extraction

### Development Tools
- **Package Manager**: npm
- **Code Quality**: ESLint, Prettier
- **Version Control**: Git
- **API Testing**: Swagger UI

## 📝 Configuration

### Environment Variables

Create `.env` file in backend directory:
```env
# LLM API Configuration (Optional)
OPENAI_API_KEY=your_api_key_here

# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_PATH=./database/invoice_extractor.db
```

### Customization Options

1. **LLM Provider**: Switch between OpenAI, Anthropic, or other providers
2. **Database**: Migrate from SQLite to PostgreSQL/MySQL
3. **File Storage**: Configure AWS S3 or local storage
4. **Authentication**: Add user management system
5. **Theming**: Customize Tailwind CSS configuration

## 🧪 Testing Strategy

### Manual Testing Checklist
- [ ] File upload with various formats
- [ ] Data extraction accuracy verification
- [ ] Data editing and validation
- [ ] Database save functionality
- [ ] History page navigation
- [ ] Database explorer features
- [ ] API endpoint responses
- [ ] Error handling scenarios

### Automated Testing (Future Enhancement)
- Unit tests for API endpoints
- Integration tests for database operations
- E2E tests for user workflows
- Performance testing for file processing
- Security testing for file uploads

## 🤝 Contributing

This is a case study implementation. For production use:

1. Implement proper error handling
2. Add comprehensive testing suite
3. Set up CI/CD pipeline
4. Add authentication/authorization
5. Implement proper logging
6. Add monitoring and alerting
7. Optimize for production deployment

## 📄 License

This project is created for case study purposes. Please refer to individual package licenses for dependencies.

## 🆘 Troubleshooting

### Common Issues

1. **Backend won't start**
   - Check if port 3001 is available
   - Verify database setup completed successfully
   - Check Node.js version (18+ required)

2. **Frontend build errors**
   - Clear node_modules and reinstall
   - Check TypeScript configuration
   - Verify all dependencies are installed

3. **Database connection issues**
   - Run `npm run setup-db` to recreate database
   - Check file permissions on database directory
   - Verify CSV files are present

4. **File upload failures**
   - Check file size limits (10MB max)
   - Verify supported file types (PDF, JPG, PNG)
   - Ensure uploads directory exists and is writable

### Support

For case study evaluation questions, please refer to the implementation details in the codebase and this documentation.

---

**Built for the Invoice Extractor Case Study**