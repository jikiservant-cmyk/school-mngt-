'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addClassAction(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get('name') as string;
  const teacherId = formData.get('teacherId') as string || null;

  if (!name) {
    return { error: 'Class name is required.' };
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'Not authenticated. Please log in.' };
    }

    // Resolve the active school ID
    const { data: staffData } = await supabase
      .from('staff_users')
      .select('people(school_id)')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    const schoolId = (staffData?.people as any)?.school_id;
    if (!schoolId) {
      return { error: 'Your school context could not be resolved. Please contact support.' };
    }

    // Find the current active academic year for this school
    let { data: activeYear } = await supabase
      .from('academic_years')
      .select('id')
      .eq('school_id', schoolId)
      .eq('is_current', true)
      .maybeSingle();

    let yearId = activeYear?.id;

    if (!yearId) {
      // Seamlessly bootstrap a current term if none exists
      const { data: newYear, error: yearErr } = await supabase
        .from('academic_years')
        .insert({
          school_id: schoolId,
          name: 'Academic Year 2026',
          is_current: true
        })
        .select('id')
        .single();

      if (yearErr) {
        return { error: `Failed to initialize academic year: ${yearErr.message}` };
      }
      yearId = newYear.id;
    }

    // Insert class record
    const { error: insertErr } = await supabase
      .from('classes')
      .insert({
        school_id: schoolId,
        academic_year_id: yearId,
        name: name.trim(),
        teacher_id: teacherId || null
      });

    if (insertErr) {
      if (insertErr.code === '23505') {
        return { error: `A class named "${name}" already exists in the current academic term.` };
      }
      return { error: insertErr.message };
    }

    revalidatePath('/dashboard/classes');
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || 'An unexpected error occurred.' };
  }
}
