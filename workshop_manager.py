import streamlit as st
import json
from datetime import datetime, date
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from database import Workshop, Registration, User, Tag, SessionLocal, workshop_tags
import pandas as pd

class WorkshopManager:
    def __init__(self):
        try:
            self.db = SessionLocal()
        except Exception as e:
            print(f"Database connection error: {e}")
            raise
    
    def close(self):
        try:
            self.db.close()
        except:
            pass
    
    def create_workshop(self, workshop_data: dict, organizer_user_id: int) -> tuple[bool, str]:
        """Create a new workshop"""
        try:
            # Parse date and time
            workshop_date = datetime.combine(workshop_data['date'], datetime.min.time())
            
            workshop = Workshop(
                title=workshop_data['title'],
                description=workshop_data.get('description', ''),
                organizer=workshop_data['organizer'],
                organizer_user_id=organizer_user_id,
                instructor=workshop_data['instructor'],
                date=workshop_date,
                time=workshop_data['time'],
                location=workshop_data['location'],
                city=workshop_data['city'],
                category=workshop_data['category'],
                level=workshop_data['level'],
                duration=workshop_data['duration'],
                price=float(workshop_data.get('price', 0)),
                max_seats=int(workshop_data['max_seats']),
                available_seats=int(workshop_data['max_seats']),
                mode=workshop_data.get('mode', 'manual'),
                prerequisites=json.dumps(workshop_data.get('prerequisites', [])),
                what_you_learn=json.dumps(workshop_data.get('what_you_learn', [])),
                agenda=json.dumps(workshop_data.get('agenda', [])),
                image_url=workshop_data.get('image_url', '')
            )
            
            self.db.add(workshop)
            self.db.commit()
            
            # Add tags if provided
            if workshop_data.get('tags'):
                self._add_tags_to_workshop(workshop.id, workshop_data['tags'])
            
            return True, f"Workshop '{workshop.title}' created successfully!"
        
        except Exception as e:
            self.db.rollback()
            return False, f"Error creating workshop: {str(e)}"
    
    def update_workshop(self, workshop_id: int, workshop_data: dict) -> tuple[bool, str]:
        """Update an existing workshop"""
        try:
            workshop = self.db.query(Workshop).filter(Workshop.id == workshop_id).first()
            if not workshop:
                return False, "Workshop not found"
            
            # Update fields
            for key, value in workshop_data.items():
                if key == 'date':
                    value = datetime.combine(value, datetime.min.time())
                elif key == 'price':
                    value = float(value)
                elif key in ['max_seats', 'available_seats']:
                    value = int(value)
                elif key in ['prerequisites', 'what_you_learn', 'agenda']:
                    value = json.dumps(value) if isinstance(value, list) else value
                
                if hasattr(workshop, key):
                    setattr(workshop, key, value)
            
            self.db.commit()
            return True, f"Workshop '{workshop.title}' updated successfully!"
        
        except Exception as e:
            self.db.rollback()
            return False, f"Error updating workshop: {str(e)}"
    
    def delete_workshop(self, workshop_id: int, user_id: int = None, user_role: str = None) -> tuple[bool, str]:
        """Delete a workshop with permission checking"""
        try:
            workshop = self.db.query(Workshop).filter(Workshop.id == workshop_id).first()
            if not workshop:
                return False, "Workshop not found"
            
            # Check permissions
            if user_role == "enterprise" and workshop.organizer_user_id != user_id:
                return False, "You can only delete your own workshops"
            
            # Check if there are any registrations
            registrations_count = self.db.query(Registration).filter(
                Registration.workshop_id == workshop_id
            ).count()
            
            if registrations_count > 0:
                return False, f"Cannot delete workshop with {registrations_count} registrations"
            
            self.db.delete(workshop)
            self.db.commit()
            return True, f"Workshop '{workshop.title}' deleted successfully!"
        
        except Exception as e:
            self.db.rollback()
            return False, f"Error deleting workshop: {str(e)}"
    
    def get_workshops(self, filters: dict = None, page: int = 1, per_page: int = 10) -> dict:
        """Get workshops with optional filtering and pagination"""
        query = self.db.query(Workshop)
        
        if filters:
            if filters.get('search'):
                search_term = f"%{filters['search']}%"
                query = query.filter(
                    or_(
                        Workshop.title.ilike(search_term),
                        Workshop.description.ilike(search_term),
                        Workshop.instructor.ilike(search_term),
                        Workshop.organizer.ilike(search_term)
                    )
                )
            
            if filters.get('category') and filters['category'] != 'All Categories':
                query = query.filter(Workshop.category == filters['category'])
            
            if filters.get('city') and filters['city'] != 'All Cities':
                query = query.filter(Workshop.city == filters['city'])
            
            if filters.get('level') and filters['level'] != 'All Levels':
                query = query.filter(Workshop.level == filters['level'])
            
            if filters.get('status') and filters['status'] != 'All':
                query = query.filter(Workshop.status == filters['status'])
            
            if filters.get('price_filter'):
                if filters['price_filter'] == 'Free':
                    query = query.filter(Workshop.price == 0)
                elif filters['price_filter'] == 'Paid':
                    query = query.filter(Workshop.price > 0)
            
            # Filter by organizer (for enterprise users)
            if filters.get('organizer_user_id'):
                query = query.filter(Workshop.organizer_user_id == filters['organizer_user_id'])
        
        # Sorting
        sort_by = filters.get('sort_by', 'created_at') if filters else 'created_at'
        if sort_by == 'date':
            query = query.order_by(Workshop.date)
        elif sort_by == 'price_low':
            query = query.order_by(Workshop.price)
        elif sort_by == 'price_high':
            query = query.order_by(Workshop.price.desc())
        elif sort_by == 'title':
            query = query.order_by(Workshop.title)
        else:
            query = query.order_by(Workshop.created_at.desc())
        
        # Pagination
        total = query.count()
        offset = (page - 1) * per_page
        workshops = query.offset(offset).limit(per_page).all()
        
        return {
            'workshops': workshops,
            'total': total,
            'page': page,
            'per_page': per_page,
            'total_pages': (total + per_page - 1) // per_page
        }
    
    def get_workshop_by_id(self, workshop_id: int) -> Optional[Workshop]:
        """Get workshop by ID"""
        return self.db.query(Workshop).filter(Workshop.id == workshop_id).first()
    
    def register_for_workshop(self, user_id: int, workshop_id: int, registration_data: dict) -> tuple[bool, str]:
        """Register user for a workshop"""
        try:
            # Check if workshop exists and has available seats
            workshop = self.db.query(Workshop).filter(Workshop.id == workshop_id).first()
            if not workshop:
                return False, "Workshop not found"
            
            if workshop.available_seats <= 0:
                return False, "No available seats for this workshop"
            
            # Check if user is already registered
            existing_registration = self.db.query(Registration).filter(
                and_(Registration.user_id == user_id, Registration.workshop_id == workshop_id)
            ).first()
            
            if existing_registration:
                return False, "You are already registered for this workshop"
            
            # Determine registration status based on workshop mode and payment
            if workshop.price == 0:
                # Free workshop
                status = "confirmed" if workshop.mode == "automated" else "pending"
                payment_status = "not_required"
            else:
                # Paid workshop
                status = "pending" if workshop.mode == "manual" else "payment_pending"
                payment_status = "pending"
            
            registration = Registration(
                user_id=user_id,
                workshop_id=workshop_id,
                registration_type=workshop.mode,
                status=status,
                payment_status=payment_status,
                payment_method=registration_data.get('payment_method'),
                transaction_id=registration_data.get('transaction_id'),
                upi_id=registration_data.get('upi_id'),
                payment_screenshot_url=registration_data.get('payment_screenshot_url'),
                notes=registration_data.get('notes', '')
            )
            
            self.db.add(registration)
            
            # Update available seats if auto-confirmed
            if status == "confirmed":
                workshop.available_seats -= 1
            
            self.db.commit()
            
            return True, f"Registration submitted successfully! Status: {status.replace('_', ' ').title()}"
        
        except Exception as e:
            self.db.rollback()
            return False, f"Registration failed: {str(e)}"
    
    def get_user_registrations(self, user_id: int) -> List[Registration]:
        """Get all registrations for a user"""
        return self.db.query(Registration).filter(Registration.user_id == user_id).all()
    
    def get_workshop_registrations(self, workshop_id: int) -> List[Registration]:
        """Get all registrations for a workshop"""
        return self.db.query(Registration).filter(Registration.workshop_id == workshop_id).all()
    
    def approve_registration(self, registration_id: int, admin_notes: str = "") -> tuple[bool, str]:
        """Approve a registration"""
        try:
            registration = self.db.query(Registration).filter(Registration.id == registration_id).first()
            if not registration:
                return False, "Registration not found"
            
            workshop = registration.workshop
            if workshop.available_seats <= 0:
                return False, "No available seats remaining"
            
            registration.status = "confirmed"
            registration.admin_notes = admin_notes
            registration.confirmed_at = datetime.utcnow()
            
            # Update available seats
            workshop.available_seats -= 1
            
            self.db.commit()
            return True, "Registration approved successfully"
        
        except Exception as e:
            self.db.rollback()
            return False, f"Error approving registration: {str(e)}"
    
    def reject_registration(self, registration_id: int, admin_notes: str = "") -> tuple[bool, str]:
        """Reject a registration"""
        try:
            registration = self.db.query(Registration).filter(Registration.id == registration_id).first()
            if not registration:
                return False, "Registration not found"
            
            registration.status = "rejected"
            registration.admin_notes = admin_notes
            
            self.db.commit()
            return True, "Registration rejected"
        
        except Exception as e:
            self.db.rollback()
            return False, f"Error rejecting registration: {str(e)}"
    
    def get_pending_registrations(self) -> List[Registration]:
        """Get all pending registrations for admin review"""
        return self.db.query(Registration).filter(
            or_(Registration.status == "pending", Registration.status == "payment_pending")
        ).all()
    
    def get_dashboard_stats(self) -> dict:
        """Get dashboard statistics"""
        total_workshops = self.db.query(Workshop).count()
        active_workshops = self.db.query(Workshop).filter(Workshop.status == "active").count()
        total_registrations = self.db.query(Registration).count()
        confirmed_registrations = self.db.query(Registration).filter(Registration.status == "confirmed").count()
        pending_registrations = self.db.query(Registration).filter(
            or_(Registration.status == "pending", Registration.status == "payment_pending")
        ).count()
        total_revenue = self.db.query(func.sum(Workshop.price)).join(Registration).filter(
            Registration.status == "confirmed"
        ).scalar() or 0
        
        return {
            'total_workshops': total_workshops,
            'active_workshops': active_workshops,
            'total_registrations': total_registrations,
            'confirmed_registrations': confirmed_registrations,
            'pending_registrations': pending_registrations,
            'total_revenue': total_revenue
        }
    
    def _add_tags_to_workshop(self, workshop_id: int, tag_names: List[str]):
        """Add tags to a workshop"""
        for tag_name in tag_names:
            tag = self.db.query(Tag).filter(Tag.name == tag_name.strip().lower()).first()
            if not tag:
                tag = Tag(name=tag_name.strip().lower())
                self.db.add(tag)
                self.db.commit()
            
            # Add association if not exists
            existing = self.db.query(workshop_tags).filter(
                and_(workshop_tags.c.workshop_id == workshop_id, workshop_tags.c.tag_id == tag.id)
            ).first()
            
            if not existing:
                stmt = workshop_tags.insert().values(workshop_id=workshop_id, tag_id=tag.id)
                self.db.execute(stmt)
        
        self.db.commit()