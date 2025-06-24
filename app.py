import streamlit as st
import pandas as pd
from datetime import datetime, date, timedelta
import json
from typing import List

# Import our modules
from database import create_tables, init_admin_user
from auth import auth_sidebar, get_current_user, require_auth, logout
from workshop_manager import WorkshopManager

# Initialize database with error handling
try:
    create_tables()
    init_admin_user()
except Exception as e:
    st.error(f"Database initialization error: {e}")
    st.info("Please refresh the page to retry database connection.")

# Page configuration
st.set_page_config(
    page_title="Workshop Booking Platform",
    page_icon="🎓",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for better styling
st.markdown("""
<style>
.main-header {
    text-align: center;
    padding: 2rem 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    margin: -1rem -1rem 2rem -1rem;
    border-radius: 0 0 1rem 1rem;
}
.workshop-card {
    background: white;
    padding: 1.5rem;
    border-radius: 1rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    border-left: 4px solid #667eea;
    margin: 1rem 0;
}
.status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.8rem;
    font-weight: bold;
}
.status-confirmed { background-color: #d4edda; color: #155724; }
.status-pending { background-color: #fff3cd; color: #856404; }
.status-rejected { background-color: #f8d7da; color: #721c24; }
</style>
""", unsafe_allow_html=True)

# Authentication and Navigation
user = auth_sidebar()

# Main navigation based on user role
if user:
    if user.role == "admin":
        page = st.sidebar.selectbox(
            "Navigation", 
            ["Dashboard", "Workshop Management", "Registration Management", "User Management", "Enterprise Management"]
        )
    elif user.role == "enterprise":
        page = st.sidebar.selectbox(
            "Navigation", 
            ["My Dashboard", "My Workshops", "My Registrations", "Create Workshop", "Profile"]
        )
    else:
        page = st.sidebar.selectbox(
            "Navigation", 
            ["Browse Workshops", "My Registrations", "Profile"]
        )
else:
    page = "Browse Workshops"

# Main header
st.markdown('<div class="main-header">', unsafe_allow_html=True)
st.title("🎓 Workshop Booking Platform")
st.markdown("*Discover and register for amazing workshops from top instructors*")
st.markdown('</div>', unsafe_allow_html=True)

# Initialize workshop manager
wm = WorkshopManager()

def show_workshop_browse_page():
    """Display workshop browsing page for all users"""
    st.header("🔍 Discover Workshops")
    
    # Search and filters
    col1, col2, col3 = st.columns([2, 1, 1])
    with col1:
        search_term = st.text_input("🔍 Search workshops, instructors, or categories", placeholder="React, AI, Marketing...")
    with col2:
        categories = ["All Categories", "Technology", "Marketing", "Design", "Finance", "Creative", "Business"]
        category_filter = st.selectbox("Category", categories)
    with col3:
        cities = ["All Cities", "Mumbai", "Bangalore", "Delhi", "Chennai", "Pune", "Hyderabad"]
        city_filter = st.selectbox("City", cities)
    
    # Additional filters in expander
    with st.expander("🎛️ More Filters"):
        col1, col2, col3 = st.columns(3)
        with col1:
            levels = ["All Levels", "Beginner", "Intermediate", "Advanced"]
            level_filter = st.selectbox("Level", levels)
        with col2:
            price_filters = ["All", "Free", "Paid"]
            price_filter = st.selectbox("Price", price_filters)
        with col3:
            sort_options = ["Newest", "Date", "Price Low to High", "Price High to Low", "Title"]
            sort_by = st.selectbox("Sort By", sort_options)
    
    # Get workshops
    filters = {
        'search': search_term if search_term else None,
        'category': category_filter,
        'city': city_filter,
        'level': level_filter,
        'price_filter': price_filter,
        'sort_by': sort_by.lower().replace(' ', '_')
    }
    
    workshops_data = wm.get_workshops(filters, page=1, per_page=10)
    workshops = workshops_data['workshops']
    
    # Display workshops
    if workshops:
        st.subheader(f"📚 Found {workshops_data['total']} workshops")
        
        for workshop in workshops:
            with st.container():
                st.markdown('<div class="workshop-card">', unsafe_allow_html=True)
                
                col1, col2, col3 = st.columns([2, 1, 1])
                
                with col1:
                    st.subheader(workshop.title)
                    st.write(f"👨‍🏫 **Instructor:** {workshop.instructor}")
                    st.write(f"🏢 **Organizer:** {workshop.organizer}")
                    st.write(f"📍 **Location:** {workshop.location}, {workshop.city}")
                    if workshop.description:
                        st.write(f"📝 {workshop.description[:100]}...")
                
                with col2:
                    st.write(f"📅 **Date:** {workshop.date.strftime('%Y-%m-%d')}")
                    st.write(f"⏰ **Time:** {workshop.time}")
                    st.write(f"⏱️ **Duration:** {workshop.duration}")
                    st.write(f"📊 **Level:** {workshop.level}")
                    st.write(f"🎯 **Category:** {workshop.category}")
                
                with col3:
                    if workshop.price > 0:
                        st.metric("💰 Price", f"₹{workshop.price:,.0f}")
                    else:
                        st.success("🆓 FREE")
                    
                    st.metric("💺 Available Seats", f"{workshop.available_seats}/{workshop.max_seats}")
                    
                    if user and workshop.available_seats > 0:
                        if st.button(f"Register Now", key=f"register_{workshop.id}"):
                            st.session_state[f'register_workshop_{workshop.id}'] = True
                            st.rerun()
                    elif workshop.available_seats == 0:
                        st.error("🚫 Fully Booked")
                    else:
                        st.info("ℹ️ Login to Register")
                
                st.markdown('</div>', unsafe_allow_html=True)
                
                # Registration form
                if user and st.session_state.get(f'register_workshop_{workshop.id}'):
                    show_registration_form(workshop)
    else:
        st.info("No workshops found matching your criteria. Try adjusting your filters.")

def show_registration_form(workshop):
    """Display registration form for a workshop"""
    st.subheader(f"Register for {workshop.title}")
    
    with st.form(f"registration_form_{workshop.id}"):
        col1, col2 = st.columns(2)
        
        with col1:
            st.write("**Workshop Details:**")
            st.write(f"Price: {'Free' if workshop.price == 0 else f'₹{workshop.price:,.0f}'}")
            st.write(f"Date: {workshop.date.strftime('%Y-%m-%d')}")
            st.write(f"Time: {workshop.time}")
            st.write(f"Duration: {workshop.duration}")
        
        with col2:
            notes = st.text_area("Notes (optional)", placeholder="Why are you interested in this workshop?")
            
            if workshop.price > 0:
                st.subheader("Payment Details")
                payment_method = st.selectbox("Payment Method", ["UPI", "Bank Transfer"])
                
                if payment_method == "UPI":
                    upi_id = st.text_input("UPI ID", placeholder="your-upi@paytm")
                    transaction_id = st.text_input("Transaction ID", placeholder="Enter transaction ID after payment")
                    st.info(f"Please pay ₹{workshop.price:,.0f} to organizer's UPI and enter transaction details")
                else:
                    transaction_id = st.text_input("Transaction Reference", placeholder="Bank transfer reference")
                    st.info("Bank details will be shared after registration")
        
        submitted = st.form_submit_button("Submit Registration")
        
        if submitted:
            registration_data = {
                'notes': notes,
                'payment_method': payment_method.lower() if workshop.price > 0 else None,
                'transaction_id': transaction_id if workshop.price > 0 else None,
                'upi_id': upi_id if workshop.price > 0 and payment_method == "UPI" else None
            }
            
            success, message = wm.register_for_workshop(user.id, workshop.id, registration_data)
            
            if success:
                st.success(message)
                del st.session_state[f'register_workshop_{workshop.id}']
                st.rerun()
            else:
                st.error(message)

def show_admin_dashboard():
    """Display admin dashboard"""
    require_auth("admin")
    
    st.header("📊 Admin Dashboard")
    
    # Get statistics
    stats = wm.get_dashboard_stats()
    
    # Display metrics
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("Total Workshops", stats['total_workshops'])
        st.metric("Active Workshops", stats['active_workshops'])
    
    with col2:
        st.metric("Total Registrations", stats['total_registrations'])
        st.metric("Confirmed", stats['confirmed_registrations'])
    
    with col3:
        st.metric("Pending Approvals", stats['pending_registrations'])
    
    with col4:
        st.metric("Total Revenue", f"₹{stats['total_revenue']:,.0f}")
    
    # Recent activity
    st.subheader("📋 Recent Activity")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Recent Workshops")
        recent_workshops = wm.get_workshops({'sort_by': 'created_at'}, per_page=5)['workshops']
        for workshop in recent_workshops:
            st.write(f"• {workshop.title} - {workshop.city}")
    
    with col2:
        st.subheader("Pending Registrations")
        pending_registrations = wm.get_pending_registrations()[:5]
        for reg in pending_registrations:
            st.write(f"• {reg.user.name} - {reg.workshop.title}")

def show_workshop_management():
    """Display workshop management page"""
    require_auth("admin")
    
    st.header("🎓 Workshop Management")
    
    tab1, tab2 = st.tabs(["All Workshops", "Create New Workshop"])
    
    with tab1:
        # Filters
        col1, col2, col3 = st.columns(3)
        with col1:
            search = st.text_input("Search workshops")
        with col2:
            status_filter = st.selectbox("Status", ["All", "active", "cancelled", "completed"])
        with col3:
            category_filter = st.selectbox("Category", ["All Categories", "Technology", "Marketing", "Design", "Finance", "Creative", "Business"])
        
        # Get workshops
        filters = {
            'search': search if search else None,
            'status': status_filter if status_filter != "All" else None,
            'category': category_filter if category_filter != "All Categories" else None
        }
        
        workshops_data = wm.get_workshops(filters, per_page=20)
        workshops = workshops_data['workshops']
        
        # Display workshops
        for workshop in workshops:
            with st.expander(f"{workshop.title} - {workshop.city} ({workshop.status})"):
                col1, col2, col3 = st.columns(3)
                
                with col1:
                    st.write(f"**Instructor:** {workshop.instructor}")
                    st.write(f"**Date:** {workshop.date.strftime('%Y-%m-%d')}")
                    st.write(f"**Time:** {workshop.time}")
                    st.write(f"**Duration:** {workshop.duration}")
                
                with col2:
                    st.write(f"**Price:** {'Free' if workshop.price == 0 else f'₹{workshop.price:,.0f}'}")
                    st.write(f"**Seats:** {workshop.available_seats}/{workshop.max_seats}")
                    st.write(f"**Mode:** {workshop.mode}")
                    st.write(f"**Status:** {workshop.status}")
                
                with col3:
                    if st.button(f"Edit", key=f"edit_{workshop.id}"):
                        st.session_state[f'edit_workshop_{workshop.id}'] = workshop
                        st.rerun()
                    
                    if st.button(f"Delete", key=f"delete_{workshop.id}"):
                        success, message = wm.delete_workshop(workshop.id)
                        if success:
                            st.success(message)
                            st.rerun()
                        else:
                            st.error(message)
                
                # Show edit form if edit button was clicked
                if st.session_state.get(f'edit_workshop_{workshop.id}'):
                    st.subheader(f"Edit Workshop: {workshop.title}")
                    show_workshop_form(workshop=st.session_state[f'edit_workshop_{workshop.id}'], form_key=f"edit_{workshop.id}")
                    if st.button("Cancel Edit", key=f"cancel_edit_{workshop.id}"):
                        del st.session_state[f'edit_workshop_{workshop.id}']
                        st.rerun()
    
    with tab2:
        show_workshop_form()

def show_workshop_form(workshop=None, form_key="workshop_form"):
    """Display workshop creation/editing form"""
    is_edit = workshop is not None
    
    with st.form(form_key):
        st.subheader("Workshop Details")
        
        col1, col2 = st.columns(2)
        
        with col1:
            title = st.text_input("Title *", value=workshop.title if is_edit else "")
            organizer = st.text_input("Organizer *", value=workshop.organizer if is_edit else "")
            instructor = st.text_input("Instructor *", value=workshop.instructor if is_edit else "")
            location = st.text_input("Location *", value=workshop.location if is_edit else "")
            city = st.selectbox("City *", ["Mumbai", "Bangalore", "Delhi", "Chennai", "Pune", "Hyderabad"], 
                               index=["Mumbai", "Bangalore", "Delhi", "Chennai", "Pune", "Hyderabad"].index(workshop.city) if is_edit else 0)
        
        with col2:
            category = st.selectbox("Category *", ["Technology", "Marketing", "Design", "Finance", "Creative", "Business"],
                                   index=["Technology", "Marketing", "Design", "Finance", "Creative", "Business"].index(workshop.category) if is_edit else 0)
            level = st.selectbox("Level *", ["Beginner", "Intermediate", "Advanced"],
                                index=["Beginner", "Intermediate", "Advanced"].index(workshop.level) if is_edit else 0)
            duration = st.text_input("Duration *", value=workshop.duration if is_edit else "", placeholder="e.g., 3 hours")
            price = st.number_input("Price (₹)", min_value=0.0, value=float(workshop.price) if is_edit else 0.0)
            max_seats = st.number_input("Max Seats *", min_value=1, value=workshop.max_seats if is_edit else 50)
        
        workshop_date = st.date_input("Date *", value=workshop.date.date() if is_edit else date.today())
        time = st.text_input("Time *", value=workshop.time if is_edit else "", placeholder="e.g., 10:00 AM")
        description = st.text_area("Description", value=workshop.description if is_edit else "")
        
        mode = st.selectbox("Registration Mode", ["manual", "automated"], 
                           index=["manual", "automated"].index(workshop.mode) if is_edit else 0)
        
        submitted = st.form_submit_button("Update Workshop" if is_edit else "Create Workshop")
        
        if submitted:
            if all([title, organizer, instructor, location, city, category, level, duration, time, max_seats]):
                workshop_data = {
                    'title': title,
                    'organizer': organizer,
                    'instructor': instructor,
                    'location': location,
                    'city': city,
                    'category': category,
                    'level': level,
                    'duration': duration,
                    'price': price,
                    'max_seats': max_seats,
                    'date': workshop_date,
                    'time': time,
                    'description': description,
                    'mode': mode
                }
                
                if is_edit:
                    success, message = wm.update_workshop(workshop.id, workshop_data)
                    if success and f'edit_workshop_{workshop.id}' in st.session_state:
                        del st.session_state[f'edit_workshop_{workshop.id}']
                else:
                    success, message = wm.create_workshop(workshop_data, user.id)
                
                if success:
                    st.success(message)
                    st.rerun()
                else:
                    st.error(message)
            else:
                st.error("Please fill in all required fields (*)")

def show_registration_management():
    """Display registration management page"""
    require_auth("admin")
    
    st.header("📝 Registration Management")
    
    tab1, tab2 = st.tabs(["Pending Approvals", "All Registrations"])
    
    with tab1:
        pending_registrations = wm.get_pending_registrations()
        
        if pending_registrations:
            st.subheader(f"⏳ {len(pending_registrations)} Pending Approvals")
            
            for registration in pending_registrations:
                with st.expander(f"{registration.user.name} - {registration.workshop.title}"):
                    col1, col2, col3 = st.columns(3)
                    
                    with col1:
                        st.write(f"**User:** {registration.user.name}")
                        st.write(f"**Email:** {registration.user.email}")
                        st.write(f"**Phone:** {registration.user.phone or 'Not provided'}")
                        st.write(f"**Registered:** {registration.registered_at.strftime('%Y-%m-%d %H:%M')}")
                    
                    with col2:
                        st.write(f"**Workshop:** {registration.workshop.title}")
                        st.write(f"**Price:** {'Free' if registration.workshop.price == 0 else f'₹{registration.workshop.price:,.0f}'}")
                        st.write(f"**Status:** {registration.status.replace('_', ' ').title()}")
                        st.write(f"**Payment Status:** {registration.payment_status.replace('_', ' ').title()}")
                    
                    with col3:
                        if registration.notes:
                            st.write(f"**Notes:** {registration.notes}")
                        
                        if registration.transaction_id:
                            st.write(f"**Transaction ID:** {registration.transaction_id}")
                        
                        if registration.upi_id:
                            st.write(f"**UPI ID:** {registration.upi_id}")
                    
                    # Admin actions
                    st.subheader("Admin Actions")
                    admin_notes = st.text_area("Admin Notes", key=f"notes_{registration.id}")
                    
                    col1, col2 = st.columns(2)
                    with col1:
                        if st.button("✅ Approve", key=f"approve_{registration.id}"):
                            success, message = wm.approve_registration(registration.id, admin_notes)
                            if success:
                                st.success(message)
                                st.rerun()
                            else:
                                st.error(message)
                    
                    with col2:
                        if st.button("❌ Reject", key=f"reject_{registration.id}"):
                            success, message = wm.reject_registration(registration.id, admin_notes)
                            if success:
                                st.success(message)
                                st.rerun()
                            else:
                                st.error(message)
        else:
            st.info("No pending registrations")
    
    with tab2:
        # Show all registrations with filters
        st.subheader("All Registrations")
        
        from database import Registration
        db = wm.db
        all_registrations = db.query(Registration).order_by(Registration.registered_at.desc()).limit(50).all()
        
        for registration in all_registrations:
            status_class = f"status-{registration.status.replace('_', '-')}"
            st.markdown(f'''
            <div class="workshop-card">
                <strong>{registration.user.name}</strong> - {registration.workshop.title}
                <br><span class="status-badge {status_class}">{registration.status.replace('_', ' ').title()}</span>
                <br>Registered: {registration.registered_at.strftime('%Y-%m-%d %H:%M')}
            </div>
            ''', unsafe_allow_html=True)

def show_user_management():
    """Display user management page"""
    require_auth("admin")
    
    st.header("👥 User Management")
    
    from database import User
    db = wm.db
    
    # Get users
    users = db.query(User).order_by(User.created_at.desc()).limit(100).all()
    
    # Display users in a table
    user_data = []
    for user_item in users:
        user_data.append({
            'ID': user_item.id,
            'Name': user_item.name,
            'Email': user_item.email,
            'Phone': user_item.phone or '',
            'Role': user_item.role,
            'Status': 'Active' if user_item.is_active else 'Inactive',
            'Registered': user_item.created_at.strftime('%Y-%m-%d')
        })
    
    df = pd.DataFrame(user_data)
    st.dataframe(df, use_container_width=True)

def show_enterprise_management():
    """Display enterprise management page for admins"""
    require_auth("admin")
    
    st.header("🏢 Enterprise Management")
    
    from database import User
    db = wm.db
    
    # Get all enterprise users
    enterprises = db.query(User).filter(User.role == "enterprise").order_by(User.created_at.desc()).all()
    
    if enterprises:
        for enterprise in enterprises:
            with st.expander(f"{enterprise.name} - {enterprise.email} ({'Active' if enterprise.is_active else 'Inactive'})"):
                col1, col2, col3 = st.columns(3)
                
                with col1:
                    st.write(f"**Name:** {enterprise.name}")
                    st.write(f"**Email:** {enterprise.email}")
                    st.write(f"**Phone:** {enterprise.phone or 'Not provided'}")
                    st.write(f"**Registered:** {enterprise.created_at.strftime('%Y-%m-%d')}")
                
                with col2:
                    workshops_count = db.query(Workshop).filter(Workshop.organizer_user_id == enterprise.id).count()
                    st.write(f"**Workshops Created:** {workshops_count}")
                    st.write(f"**Status:** {'Active' if enterprise.is_active else 'Inactive'}")
                
                with col3:
                    if enterprise.is_active:
                        if st.button(f"Deactivate", key=f"deactivate_{enterprise.id}"):
                            enterprise.is_active = False
                            db.commit()
                            st.success("Enterprise deactivated")
                            st.rerun()
                    else:
                        if st.button(f"Activate", key=f"activate_{enterprise.id}"):
                            enterprise.is_active = True
                            db.commit()
                            st.success("Enterprise activated")
                            st.rerun()
    else:
        st.info("No enterprise accounts found")

def show_enterprise_dashboard():
    """Display enterprise dashboard"""
    user = require_auth("enterprise")
    
    if not user.is_active:
        st.warning("Your enterprise account is pending admin approval. Please contact support if this takes too long.")
        return
    
    st.header("🏢 Enterprise Dashboard")
    
    # Get enterprise statistics
    db = wm.db
    total_workshops = db.query(Workshop).filter(Workshop.organizer_user_id == user.id).count()
    active_workshops = db.query(Workshop).filter(
        Workshop.organizer_user_id == user.id, Workshop.status == "active"
    ).count()
    
    total_registrations = db.query(Registration).join(Workshop).filter(
        Workshop.organizer_user_id == user.id
    ).count()
    
    confirmed_registrations = db.query(Registration).join(Workshop).filter(
        Workshop.organizer_user_id == user.id, Registration.status == "confirmed"
    ).count()
    
    # Display metrics
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("Total Workshops", total_workshops)
    with col2:
        st.metric("Active Workshops", active_workshops)
    with col3:
        st.metric("Total Registrations", total_registrations)
    with col4:
        st.metric("Confirmed Registrations", confirmed_registrations)
    
    # Recent workshops
    st.subheader("Recent Workshops")
    recent_workshops = db.query(Workshop).filter(
        Workshop.organizer_user_id == user.id
    ).order_by(Workshop.created_at.desc()).limit(5).all()
    
    for workshop in recent_workshops:
        st.write(f"• {workshop.title} - {workshop.city} ({workshop.status})")

def show_enterprise_workshops():
    """Display enterprise workshops management"""
    user = require_auth("enterprise")
    
    if not user.is_active:
        st.warning("Your enterprise account is pending admin approval.")
        return
    
    st.header("🎓 My Workshops")
    
    # Get enterprise workshops
    filters = {'organizer_user_id': user.id}
    workshops_data = wm.get_workshops(filters, per_page=50)
    workshops = workshops_data['workshops']
    
    if workshops:
        for workshop in workshops:
            with st.expander(f"{workshop.title} - {workshop.city} ({workshop.status})"):
                col1, col2, col3 = st.columns(3)
                
                with col1:
                    st.write(f"**Date:** {workshop.date.strftime('%Y-%m-%d')}")
                    st.write(f"**Time:** {workshop.time}")
                    st.write(f"**Duration:** {workshop.duration}")
                    st.write(f"**Level:** {workshop.level}")
                
                with col2:
                    st.write(f"**Price:** {'Free' if workshop.price == 0 else f'₹{workshop.price:,.0f}'}")
                    st.write(f"**Seats:** {workshop.available_seats}/{workshop.max_seats}")
                    st.write(f"**Mode:** {workshop.mode}")
                    st.write(f"**Category:** {workshop.category}")
                
                with col3:
                    registrations_count = len(workshop.registrations)
                    st.write(f"**Registrations:** {registrations_count}")
                    
                    if st.button(f"Edit", key=f"edit_ent_{workshop.id}"):
                        st.session_state[f'edit_workshop_{workshop.id}'] = workshop
                        st.rerun()
                    
                    if st.button(f"Delete", key=f"delete_ent_{workshop.id}"):
                        success, message = wm.delete_workshop(workshop.id)
                        if success:
                            st.success(message)
                            st.rerun()
                        else:
                            st.error(message)
                
                # Show edit form if edit button was clicked
                if st.session_state.get(f'edit_workshop_{workshop.id}'):
                    st.subheader(f"Edit Workshop: {workshop.title}")
                    show_workshop_form(workshop=st.session_state[f'edit_workshop_{workshop.id}'], form_key=f"edit_ent_{workshop.id}")
                    if st.button("Cancel Edit", key=f"cancel_edit_ent_{workshop.id}"):
                        del st.session_state[f'edit_workshop_{workshop.id}']
                        st.rerun()
    else:
        st.info("You haven't created any workshops yet. Use the 'Create Workshop' page to get started.")

def show_enterprise_registrations():
    """Display registrations for enterprise workshops"""
    user = require_auth("enterprise")
    
    if not user.is_active:
        st.warning("Your enterprise account is pending admin approval.")
        return
    
    st.header("📝 Workshop Registrations")
    
    # Get all registrations for this enterprise's workshops
    db = wm.db
    registrations = db.query(Registration).join(Workshop).filter(
        Workshop.organizer_user_id == user.id
    ).order_by(Registration.registered_at.desc()).all()
    
    if registrations:
        # Filter options
        col1, col2 = st.columns(2)
        with col1:
            status_filter = st.selectbox("Filter by Status", ["All", "pending", "confirmed", "rejected"])
        with col2:
            workshop_titles = list(set([reg.workshop.title for reg in registrations]))
            workshop_filter = st.selectbox("Filter by Workshop", ["All Workshops"] + workshop_titles)
        
        # Apply filters
        filtered_registrations = registrations
        if status_filter != "All":
            filtered_registrations = [r for r in filtered_registrations if r.status == status_filter]
        if workshop_filter != "All Workshops":
            filtered_registrations = [r for r in filtered_registrations if r.workshop.title == workshop_filter]
        
        for registration in filtered_registrations:
            with st.expander(f"{registration.user.name} - {registration.workshop.title}"):
                col1, col2, col3 = st.columns(3)
                
                with col1:
                    st.write(f"**User:** {registration.user.name}")
                    st.write(f"**Email:** {registration.user.email}")
                    st.write(f"**Phone:** {registration.user.phone or 'Not provided'}")
                    st.write(f"**Registered:** {registration.registered_at.strftime('%Y-%m-%d %H:%M')}")
                
                with col2:
                    st.write(f"**Workshop:** {registration.workshop.title}")
                    st.write(f"**Status:** {registration.status.replace('_', ' ').title()}")
                    if registration.notes:
                        st.write(f"**Notes:** {registration.notes}")
                
                with col3:
                    if registration.transaction_id:
                        st.write(f"**Transaction ID:** {registration.transaction_id}")
                    if registration.upi_id:
                        st.write(f"**UPI ID:** {registration.upi_id}")
                    
                    # Action buttons for manual workshops
                    if registration.workshop.mode == "manual" and registration.status == "pending":
                        col_a, col_b = st.columns(2)
                        with col_a:
                            if st.button("✅ Approve", key=f"approve_ent_{registration.id}"):
                                success, message = wm.approve_registration(registration.id)
                                if success:
                                    st.success(message)
                                    st.rerun()
                                else:
                                    st.error(message)
                        with col_b:
                            if st.button("❌ Reject", key=f"reject_ent_{registration.id}"):
                                success, message = wm.reject_registration(registration.id)
                                if success:
                                    st.success(message)
                                    st.rerun()
                                else:
                                    st.error(message)
    else:
        st.info("No registrations found for your workshops yet.")

def show_my_registrations():
    """Display user's registrations"""
    user = require_auth()
    
    st.header("📝 My Registrations")
    
    registrations = wm.get_user_registrations(user.id)
    
    if registrations:
        for registration in registrations:
            workshop = registration.workshop
            
            st.markdown('<div class="workshop-card">', unsafe_allow_html=True)
            
            col1, col2, col3 = st.columns([2, 1, 1])
            
            with col1:
                st.subheader(workshop.title)
                st.write(f"👨‍🏫 **Instructor:** {workshop.instructor}")
                st.write(f"📍 **Location:** {workshop.location}, {workshop.city}")
                st.write(f"📅 **Date:** {workshop.date.strftime('%Y-%m-%d')}")
                st.write(f"⏰ **Time:** {workshop.time}")
            
            with col2:
                status_class = f"status-{registration.status.replace('_', '-')}"
                st.markdown(f'<span class="status-badge {status_class}">{registration.status.replace("_", " ").title()}</span>', 
                           unsafe_allow_html=True)
                st.write(f"**Registered:** {registration.registered_at.strftime('%Y-%m-%d')}")
                if registration.confirmed_at:
                    st.write(f"**Confirmed:** {registration.confirmed_at.strftime('%Y-%m-%d')}")
            
            with col3:
                if workshop.price > 0:
                    st.write(f"**Price:** ₹{workshop.price:,.0f}")
                    st.write(f"**Payment:** {registration.payment_status.replace('_', ' ').title()}")
                else:
                    st.write("**Price:** Free")
                
                if registration.admin_notes:
                    st.write(f"**Admin Notes:** {registration.admin_notes}")
            
            st.markdown('</div>', unsafe_allow_html=True)
    else:
        st.info("You haven't registered for any workshops yet.")

def show_user_profile():
    """Display user profile page"""
    user = require_auth()
    
    st.header("👤 My Profile")
    
    with st.form("profile_form"):
        col1, col2 = st.columns(2)
        
        with col1:
            name = st.text_input("Name", value=user.name)
            email = st.text_input("Email", value=user.email, disabled=True)
        
        with col2:
            phone = st.text_input("Phone", value=user.phone or "")
            # Add password change option
            change_password = st.checkbox("Change Password")
        
        if change_password:
            current_password = st.text_input("Current Password", type="password")
            new_password = st.text_input("New Password", type="password")
            confirm_password = st.text_input("Confirm New Password", type="password")
        
        submitted = st.form_submit_button("Update Profile")
        
        if submitted:
            # Update profile logic here
            st.success("Profile updated successfully!")

# Page routing based on user authentication and role
if not user:
    show_workshop_browse_page()
elif user.role == "admin":
    if page == "Dashboard":
        show_admin_dashboard()
    elif page == "Workshop Management":
        show_workshop_management()
    elif page == "Registration Management":
        show_registration_management()
    elif page == "User Management":
        show_user_management()
    elif page == "Enterprise Management":
        show_enterprise_management()
elif user.role == "enterprise":
    if page == "My Dashboard":
        show_enterprise_dashboard()
    elif page == "My Workshops":
        show_enterprise_workshops()
    elif page == "My Registrations":
        show_enterprise_registrations()
    elif page == "Create Workshop":
        show_workshop_form()
    elif page == "Profile":
        show_user_profile()
else:
    if page == "Browse Workshops":
        show_workshop_browse_page()
    elif page == "My Registrations":
        show_my_registrations()
    elif page == "Profile":
        show_user_profile()

wm.close()