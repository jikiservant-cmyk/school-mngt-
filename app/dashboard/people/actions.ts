'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addPersonAction(formData: FormData) {
  const supabase = await createClient();
  const fullName = formData.get('fullName') as string;
  const role = formData.get('role') as 'student' | 'teacher';
  
  if (!fullName || !role) {
    return { error: 'Full Name and Role are required.' };
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'Not authenticated. Please log in.' };
    }

    // Build params dynamically based on selected role
    let params: Record<string, any> = {
      p_role: role,
      p_full_name: fullName.trim(),
    };

    const deviceUserId = formData.get('deviceUserId') as string;
    if (deviceUserId && deviceUserId.trim()) {
      params.p_device_user_id = deviceUserId.trim();
    } else {
      params.p_device_user_id = null;
    }

    if (role === 'student') {
      const classId = formData.get('classId') as string;
      if (!classId) {
        return { error: 'Please select a class for the student.' };
      }
      params.p_class_id = classId;

      const guardianName = formData.get('guardianName') as string;
      const guardianPhone = formData.get('guardianPhone') as string;
      const guardianRelationship = formData.get('guardianRelationship') as string || 'guardian';

      if (guardianName && guardianName.trim()) {
        params.p_guardian_full_name = guardianName.trim();
      }
      if (guardianPhone && guardianPhone.trim()) {
        params.p_guardian_phone = guardianPhone.trim();
      }
      params.p_guardian_relationship = guardianRelationship.trim();

    } else if (role === 'teacher') {
      const phone = formData.get('phone') as string;
      const pin = formData.get('pin') as string;
      
      // Get array of selected class IDs
      const classIdsJson = formData.get('classIdsJson') as string;
      let classIds: string[] = [];
      if (classIdsJson) {
        try {
          classIds = JSON.parse(classIdsJson);
        } catch (e) {
          console.error('Failed to parse classIds:', e);
        }
      }

      if (phone && phone.trim()) {
        params.p_phone = phone.trim();
      } else {
        params.p_phone = null;
      }

      if (pin && pin.trim()) {
        if (!/^\d{4,6}$/.test(pin.trim())) {
          return { error: 'PIN must be 4 to 6 digits.' };
        }
        params.p_pin = pin.trim();
      } else {
        params.p_pin = null;
      }

      params.p_class_ids = classIds.length > 0 ? classIds : null;
      params.p_issue_manual_link = true;
    } else {
      return { error: 'Invalid role selection.' };
    }

    // Invoke the RPC function school.fn_add_person
    const { data, error } = await (supabase as any).rpc('fn_add_person', params);

    if (error) {
      console.error('Error executing fn_add_person:', error);
      
      // Map database custom exception error codes or messages to friendly human feedback
      const errMsg = error.message || '';
      if (errMsg.includes('not_authenticated_staff')) {
        return { error: 'You need to be logged in as a school staff/admin to perform this action.' };
      }
      if (errMsg.includes('not_authorized')) {
        return { error: 'Only school administrators can register new members.' };
      }
      if (errMsg.includes('invalid_role_use_student_or_teacher')) {
        return { error: 'Role selection must be either Student or Teacher.' };
      }
      if (errMsg.includes('student_requires_class_id')) {
        return { error: 'A student registration requires a valid class assignment.' };
      }
      if (errMsg.includes('invalid_class_for_school')) {
        return { error: 'The chosen class assignment does not belong to your school.' };
      }
      if (errMsg.includes('invalid_pin_format')) {
        return { error: 'The teacher PIN must contain between 4 and 6 digits.' };
      }
      if (error.code === '23505') {
        return { error: 'The biometric Enrollment ID is already registered to another person.' };
      }

      return { error: error.message || 'The registry transaction failed in the database.' };
    }

    revalidatePath('/dashboard/people');
    return { 
      success: true,
      data 
    };
  } catch (err: any) {
    console.error('addPersonAction server error:', err);
    return { error: err?.message || 'An unexpected error occurred.' };
  }
}
