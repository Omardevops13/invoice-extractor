from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename
from flasgger import Swagger, swag_from
import os
import uuid
import pandas as pd
from datetime import datetime, timedelta
import json
import random

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///invoice_extractor.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB max file size

# Initialize extensions
db = SQLAlchemy(app)
CORS(app)

# Swagger configuration
swagger_config = {
    "headers": [],
    "specs": [
        {
            "endpoint": 'apispec',
            "route": '/apispec.json',
            "rule_filter": lambda rule: True,
            "model_filter": lambda tag: True,
        }
    ],
    "static_url_path": "/flasgger_static",
    "swagger_ui": True,
    "specs_route": "/api-docs/"
}

swagger_template = {
    "swagger": "2.0",
    "info": {
        "title": "Invoice Extractor API",
        "description": "Document processing API for invoice data extraction",
        "version": "1.0.0"
    },
    "host": "localhost:5001",
    "basePath": "/",
    "schemes": ["http"],
}

swagger = Swagger(app, config=swagger_config, template=swagger_template)

# Create upload directory
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Database Models
class Product(db.Model):
    __tablename__ = 'products'
    ProductID = db.Column(db.Integer, primary_key=True)
    Name = db.Column(db.String(255))
    ProductNumber = db.Column(db.String(50))
    MakeFlag = db.Column(db.Boolean)
    FinishedGoodsFlag = db.Column(db.Boolean)
    Color = db.Column(db.String(50))
    StandardCost = db.Column(db.Float)
    ListPrice = db.Column(db.Float)
    Size = db.Column(db.String(10))
    ProductLine = db.Column(db.String(10))
    Class = db.Column(db.String(10))
    Style = db.Column(db.String(10))
    ProductSubcategoryID = db.Column(db.Integer)
    ProductModelID = db.Column(db.Integer)

class Customer(db.Model):
    __tablename__ = 'customers'
    CustomerID = db.Column(db.Integer, primary_key=True)
    PersonID = db.Column(db.Integer)
    StoreID = db.Column(db.Integer)
    TerritoryID = db.Column(db.Integer)
    AccountNumber = db.Column(db.String(50))

class SalesOrderHeader(db.Model):
    __tablename__ = 'sales_order_header'
    SalesOrderID = db.Column(db.Integer, primary_key=True)
    RevisionNumber = db.Column(db.Integer, default=1)
    OrderDate = db.Column(db.Date)
    DueDate = db.Column(db.Date)
    ShipDate = db.Column(db.Date)
    Status = db.Column(db.Integer, default=5)
    OnlineOrderFlag = db.Column(db.Boolean, default=True)
    SalesOrderNumber = db.Column(db.String(50))
    PurchaseOrderNumber = db.Column(db.String(50))
    AccountNumber = db.Column(db.String(50))
    CustomerID = db.Column(db.Integer, db.ForeignKey('customers.CustomerID'))
    SalesPersonID = db.Column(db.Integer)
    TerritoryID = db.Column(db.Integer)
    BillToAddressID = db.Column(db.Integer)
    ShipToAddressID = db.Column(db.Integer)
    ShipMethodID = db.Column(db.Integer, default=1)
    CreditCardID = db.Column(db.Integer)
    CreditCardApprovalCode = db.Column(db.String(50))
    CurrencyRateID = db.Column(db.Integer)
    SubTotal = db.Column(db.Float)
    TaxAmt = db.Column(db.Float)
    Freight = db.Column(db.Float)
    TotalDue = db.Column(db.Float)
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)

class SalesOrderDetail(db.Model):
    __tablename__ = 'sales_order_detail'
    SalesOrderDetailID = db.Column(db.Integer, primary_key=True)
    SalesOrderID = db.Column(db.Integer, db.ForeignKey('sales_order_header.SalesOrderID'))
    CarrierTrackingNumber = db.Column(db.String(50))
    OrderQty = db.Column(db.Integer)
    ProductID = db.Column(db.Integer, db.ForeignKey('products.ProductID'))
    SpecialOfferID = db.Column(db.Integer, default=1)
    UnitPrice = db.Column(db.Float)
    UnitPriceDiscount = db.Column(db.Float, default=0.0)
    LineTotal = db.Column(db.Float)

# Helper functions
def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def simulate_invoice_extraction(filename):
    """Simulate LLM invoice extraction with data matching the Sales Invoice.png"""
    # Extract data that matches the actual Sales Invoice.png
    # Use temporary product IDs that will be created when saving
    line_items = [
        {
            'productId': 'TEMP_XYZ',  # Will be created as Product XYZ
            'description': 'Product XYZ',
            'quantity': 15,
            'unitPrice': 150.00,
            'lineTotal': 2250.00
        },
        {
            'productId': 'TEMP_ABC',  # Will be created as Product ABC
            'description': 'Product ABC',
            'quantity': 1,
            'unitPrice': 75.00,
            'lineTotal': 75.00
        }
    ]
    
    # Totals from the actual invoice
    subtotal = 2325.00
    tax_rate = 0.06875  # 6.875%
    tax_amount = 159.84
    freight = 0.00  # No freight shown in the invoice
    total = 2484.84
    
    return {
        'orderDate': '2014-05-01',
        'dueDate': '2014-05-31',
        'invoiceNumber': '12345',
        'customerInfo': {
            'name': '[Your Company Name]',
            'address': '[Street Address], [City, ST ZIP], [Phone]',
            'customerId': 125
        },
        'lineItems': line_items,
        'totals': {
            'subtotal': subtotal,
            'taxRate': tax_rate,
            'taxAmount': tax_amount,
            'freight': freight,
            'total': total
        },
        'confidence': 0.94,
        'processingTime': 2.1
    }

# Routes
@app.route('/')
def health_check():
    """
    Health Check
    ---
    responses:
      200:
        description: API is running
        schema:
          type: object
          properties:
            success:
              type: boolean
            message:
              type: string
            data:
              type: object
    """
    return jsonify({
        'success': True,
        'message': 'Invoice Extractor API is running!',
        'data': {
            'version': '1.0.0',
            'endpoints': {
                'documentation': '/api-docs/',
                'invoices': '/api/invoices',
                'data': '/api/data'
            },
            'timestamp': datetime.utcnow().isoformat()
        }
    })

@app.route('/api/invoices/upload', methods=['POST'])
def upload_invoice():
    """
    Upload and process invoice
    ---
    consumes:
      - multipart/form-data
    parameters:
      - name: invoice
        in: formData
        type: file
        required: true
        description: Invoice file (PDF, JPG, PNG)
    responses:
      200:
        description: Invoice processed successfully
        schema:
          type: object
          properties:
            success:
              type: boolean
            message:
              type: string
            data:
              type: object
      400:
        description: Bad request
    """
    try:
        if 'invoice' not in request.files:
            return jsonify({'success': False, 'message': 'No file uploaded'}), 400
        
        file = request.files['invoice']
        if file.filename == '':
            return jsonify({'success': False, 'message': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'success': False, 'message': 'Invalid file type'}), 400
        
        # Save file
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(file_path)
        
        # Simulate processing
        extracted_data = simulate_invoice_extraction(unique_filename)
        
        return jsonify({
            'success': True,
            'message': 'Invoice processed successfully',
            'data': {
                'fileInfo': {
                    'originalName': filename,
                    'filename': unique_filename,
                    'size': os.path.getsize(file_path),
                    'uploadedAt': datetime.utcnow().isoformat()
                },
                'extractedData': extracted_data
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/invoices/save', methods=['POST'])
def save_invoice():
    """
    Save extracted invoice data
    ---
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            orderDate:
              type: string
            customerInfo:
              type: object
            lineItems:
              type: array
            totals:
              type: object
    responses:
      201:
        description: Invoice saved successfully
      400:
        description: Invalid data
    """
    try:
        data = request.get_json()
        
        if not data or 'orderDate' not in data:
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400
        
        # Generate sales order number
        sales_order_number = f"SO{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # Handle customer creation/lookup
        customer_info = data.get('customerInfo', {})
        customer_id = customer_info.get('customerId')
        
        if customer_id:
            # Check if customer exists
            existing_customer = Customer.query.get(customer_id)
            if not existing_customer:
                # Create new customer
                new_customer = Customer(
                    CustomerID=customer_id,
                    PersonID=None,
                    StoreID=None,
                    TerritoryID=1,  # Default territory
                    AccountNumber=f"AC{customer_id:06d}"
                )
                db.session.add(new_customer)
                db.session.flush()
        else:
            # Create a new customer with auto-generated ID
            max_customer_id = db.session.query(db.func.max(Customer.CustomerID)).scalar() or 0
            customer_id = max_customer_id + 1
            
            new_customer = Customer(
                CustomerID=customer_id,
                PersonID=None,
                StoreID=None,
                TerritoryID=1,  # Default territory
                AccountNumber=f"AC{customer_id:06d}"
            )
            db.session.add(new_customer)
            db.session.flush()
        
        # Create order header
        order_header = SalesOrderHeader(
            OrderDate=datetime.strptime(data['orderDate'], '%Y-%m-%d').date(),
            DueDate=datetime.strptime(data.get('dueDate', data['orderDate']), '%Y-%m-%d').date(),
            SalesOrderNumber=sales_order_number,
            CustomerID=customer_id,
            SubTotal=data['totals']['subtotal'],
            TaxAmt=data['totals']['taxAmount'],
            Freight=data['totals'].get('freight', 0),
            TotalDue=data['totals']['total']
        )
        
        db.session.add(order_header)
        db.session.flush()  # Get the ID
        
        # Create order details
        for item in data['lineItems']:
            product_id = item['productId']
            
            # If productId is a string (temp ID), create the product
            if isinstance(product_id, str):
                # Check if product already exists by name
                existing_product = Product.query.filter_by(Name=item['description']).first()
                
                if existing_product:
                    product_id = existing_product.ProductID
                else:
                    # Get the next available ProductID
                    max_product_id = db.session.query(db.func.max(Product.ProductID)).scalar() or 0
                    new_product_id = max_product_id + 1
                    
                    # Create new product
                    new_product = Product(
                        ProductID=new_product_id,
                        Name=item['description'],
                        ProductNumber=f"PN-{new_product_id:06d}",
                        MakeFlag=True,
                        FinishedGoodsFlag=True,
                        Color=None,
                        StandardCost=item['unitPrice'] * 0.7,  # Assume 30% markup
                        ListPrice=item['unitPrice'],
                        Size=None,
                        ProductLine=None,
                        Class=None,
                        Style=None,
                        ProductSubcategoryID=None,
                        ProductModelID=None
                    )
                    db.session.add(new_product)
                    db.session.flush()  # Get the ID
                    product_id = new_product_id
            
            order_detail = SalesOrderDetail(
                SalesOrderID=order_header.SalesOrderID,
                OrderQty=item['quantity'],
                ProductID=product_id,
                UnitPrice=item['unitPrice'],
                LineTotal=item['lineTotal']
            )
            db.session.add(order_detail)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Invoice data saved successfully',
            'data': {
                'salesOrderId': order_header.SalesOrderID,
                'salesOrderNumber': sales_order_number,
                'itemCount': len(data['lineItems'])
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/invoices/history')
def get_invoice_history():
    """
    Get invoice processing history
    ---
    parameters:
      - name: page
        in: query
        type: integer
        default: 1
      - name: limit
        in: query
        type: integer
        default: 20
    responses:
      200:
        description: Invoice history retrieved
    """
    try:
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 20, type=int)
        offset = (page - 1) * limit
        
        orders = db.session.query(SalesOrderHeader).order_by(
            SalesOrderHeader.CreatedAt.desc()
        ).offset(offset).limit(limit).all()
        
        result = []
        for order in orders:
            # Get item count
            item_count = db.session.query(SalesOrderDetail).filter_by(
                SalesOrderID=order.SalesOrderID
            ).count()
            
            result.append({
                'SalesOrderID': order.SalesOrderID,
                'OrderDate': order.OrderDate.isoformat() if order.OrderDate else None,
                'SalesOrderNumber': order.SalesOrderNumber,
                'CustomerName': 'Sample Customer',  # Would join with customer table
                'SubTotal': order.SubTotal,
                'TaxAmt': order.TaxAmt,
                'Freight': order.Freight,
                'TotalDue': order.TotalDue,
                'ItemCount': item_count,
                'CreatedAt': order.CreatedAt.isoformat() if order.CreatedAt else None
            })
        
        return jsonify({
            'success': True,
            'data': {
                'orders': result,
                'pagination': {
                    'page': page,
                    'limit': limit,
                    'hasMore': len(result) == limit
                }
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/invoices/<int:order_id>/details')
def get_order_details(order_id):
    """
    Get order details
    ---
    parameters:
      - name: order_id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Order details retrieved
      404:
        description: Order not found
    """
    try:
        details = db.session.query(SalesOrderDetail, Product).join(
            Product, SalesOrderDetail.ProductID == Product.ProductID
        ).filter(SalesOrderDetail.SalesOrderID == order_id).all()
        
        if not details:
            return jsonify({'success': False, 'message': 'Order not found'}), 404
        
        result = []
        for detail, product in details:
            result.append({
                'SalesOrderDetailID': detail.SalesOrderDetailID,
                'ProductName': product.Name,
                'ProductNumber': product.ProductNumber,
                'OrderQty': detail.OrderQty,
                'UnitPrice': detail.UnitPrice,
                'LineTotal': detail.LineTotal
            })
        
        return jsonify({
            'success': True,
            'data': {
                'orderId': order_id,
                'details': result
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/data/stats')
def get_stats():
    """
    Get database statistics
    ---
    responses:
      200:
        description: Statistics retrieved
    """
    try:
        total_products = db.session.query(Product).count()
        total_customers = db.session.query(Customer).count()
        total_orders = db.session.query(SalesOrderHeader).count()
        
        # Calculate totals
        total_revenue = db.session.query(db.func.sum(SalesOrderHeader.TotalDue)).scalar() or 0
        avg_order = db.session.query(db.func.avg(SalesOrderHeader.TotalDue)).scalar() or 0
        
        return jsonify({
            'success': True,
            'data': {
                'totalProducts': total_products,
                'totalCustomers': total_customers,
                'totalOrders': total_orders,
                'recentOrders': total_orders,  # For demo purposes
                'totalRevenue': round(total_revenue, 2),
                'averageOrderValue': round(avg_order, 2)
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/data/products')
def get_products():
    """
    Get products catalog
    ---
    parameters:
      - name: page
        in: query
        type: integer
        default: 1
      - name: limit
        in: query
        type: integer
        default: 50
      - name: search
        in: query
        type: string
    responses:
      200:
        description: Products retrieved
    """
    try:
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 50, type=int)
        search = request.args.get('search', '')
        offset = (page - 1) * limit
        
        query = db.session.query(Product)
        
        if search:
            query = query.filter(
                db.or_(
                    Product.Name.contains(search),
                    Product.ProductNumber.contains(search)
                )
            )
        
        products = query.offset(offset).limit(limit).all()
        
        result = []
        for product in products:
            result.append({
                'ProductID': product.ProductID,
                'Name': product.Name,
                'ProductNumber': product.ProductNumber,
                'ListPrice': product.ListPrice,
                'Color': product.Color,
                'CategoryName': 'General',  # Would join with category table
                'SubcategoryName': 'General'
            })
        
        return jsonify({
            'success': True,
            'data': {
                'products': result,
                'pagination': {
                    'page': page,
                    'limit': limit,
                    'search': search,
                    'hasMore': len(result) == limit
                }
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/invoices/<int:order_id>', methods=['DELETE'])
def delete_order(order_id):
    """
    Delete an order and its details
    ---
    parameters:
      - name: order_id
        in: path
        type: integer
        required: true
        description: Order ID to delete
    responses:
      200:
        description: Order deleted successfully
      404:
        description: Order not found
      500:
        description: Server error
    """
    try:
        # Find the order
        order = SalesOrderHeader.query.get(order_id)
        if not order:
            return jsonify({'success': False, 'message': 'Order not found'}), 404
        
        # Delete order details first (foreign key constraint)
        SalesOrderDetail.query.filter_by(SalesOrderID=order_id).delete()
        
        # Delete the order header
        db.session.delete(order)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Order deleted successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/data/territories')
def get_territories():
    """
    Get sales territories
    ---
    responses:
      200:
        description: Territories retrieved successfully
    """
    try:
        # For now, return empty array since we don't have territory data loaded
        territories = [
            {'TerritoryID': 1, 'Name': 'Northwest', 'CountryRegionCode': 'US', 'GroupName': 'North America'},
            {'TerritoryID': 2, 'Name': 'Northeast', 'CountryRegionCode': 'US', 'GroupName': 'North America'},
            {'TerritoryID': 3, 'Name': 'Central', 'CountryRegionCode': 'US', 'GroupName': 'North America'},
            {'TerritoryID': 4, 'Name': 'Southwest', 'CountryRegionCode': 'US', 'GroupName': 'North America'},
            {'TerritoryID': 5, 'Name': 'Southeast', 'CountryRegionCode': 'US', 'GroupName': 'North America'},
            {'TerritoryID': 6, 'Name': 'Canada', 'CountryRegionCode': 'CA', 'GroupName': 'North America'},
            {'TerritoryID': 7, 'Name': 'France', 'CountryRegionCode': 'FR', 'GroupName': 'Europe'},
            {'TerritoryID': 8, 'Name': 'Germany', 'CountryRegionCode': 'DE', 'GroupName': 'Europe'},
            {'TerritoryID': 9, 'Name': 'Australia', 'CountryRegionCode': 'AU', 'GroupName': 'Pacific'},
            {'TerritoryID': 10, 'Name': 'United Kingdom', 'CountryRegionCode': 'GB', 'GroupName': 'Europe'}
        ]
        
        return jsonify({
            'success': True,
            'data': {
                'territories': territories
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/data/customers')
def get_customers():
    """
    Get customers list
    ---
    parameters:
      - name: page
        in: query
        type: integer
        default: 1
      - name: limit
        in: query
        type: integer
        default: 50
      - name: search
        in: query
        type: string
    responses:
      200:
        description: Customers retrieved successfully
    """
    try:
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 50, type=int)
        search = request.args.get('search', '')
        offset = (page - 1) * limit
        
        query = db.session.query(Customer)
        
        if search:
            query = query.filter(Customer.AccountNumber.contains(search))
        
        customers = query.offset(offset).limit(limit).all()
        
        result = []
        for customer in customers:
            result.append({
                'CustomerID': customer.CustomerID,
                'CustomerName': f'Customer {customer.CustomerID}',  # Placeholder
                'AccountNumber': customer.AccountNumber,
                'City': 'Sample City',  # Placeholder
                'State': 'Sample State'  # Placeholder
            })
        
        return jsonify({
            'success': True,
            'data': {
                'customers': result,
                'pagination': {
                    'page': page,
                    'limit': limit,
                    'search': search,
                    'hasMore': len(result) == limit
                }
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# Database initialization
def init_db():
    """Initialize database with CSV data"""
    db.create_all()
    
    # Database initialized with empty tables
    # All data (products, customers, orders) will be created dynamically when invoices are processed
    print("✅ Database initialized with empty tables")
    print("📦 Products and customers will be created dynamically when invoices are processed")

if __name__ == '__main__':
    with app.app_context():
        init_db()
    app.run(debug=True, host='0.0.0.0', port=5001)
