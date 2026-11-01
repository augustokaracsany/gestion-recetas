import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from './config';

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { success: true, user: result.user };
  } catch (error: any) {
    console.warn('Google Sign-In notice:', error?.message);
    return { 
      success: false, 
      message: error?.message || 'Error al iniciar sesión con Google.',
      code: error?.code
    };
  }
}

export async function registerWithEmail(email: string, pass: string, displayName: string) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    if (result.user && displayName) {
      await updateProfile(result.user, { displayName });
    }
    return { success: true, user: result.user };
  } catch (error: any) {
    if (error?.code === 'auth/operation-not-allowed') {
      // Email/password provider is not turned on in Firebase console.
      // Handled cleanly without raising uncaught exceptions.
      return { 
        success: false, 
        code: 'auth/operation-not-allowed', 
        message: 'El proveedor de email y contraseña no está habilitado en Firebase Console.' 
      };
    }
    console.warn('Email registration notice:', error?.code);
    let msg = 'Error al crear la cuenta.';
    if (error?.code === 'auth/email-already-in-use') {
      msg = 'Este correo electrónico ya está registrado en Firebase.';
    } else if (error?.code === 'auth/weak-password') {
      msg = 'La contraseña debe tener al menos 6 caracteres.';
    } else if (error?.code === 'auth/invalid-email') {
      msg = 'El formato del correo es inválido.';
    }
    return { success: false, message: msg, code: error?.code };
  }
}

export async function loginWithEmail(email: string, pass: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return { success: true, user: result.user };
  } catch (error: any) {
    if (error?.code === 'auth/operation-not-allowed') {
      // Email/password provider is not turned on in Firebase console.
      // Handled cleanly without raising uncaught exceptions.
      return { 
        success: false, 
        code: 'auth/operation-not-allowed', 
        message: 'El proveedor de email y contraseña no está habilitado en Firebase Console.' 
      };
    }
    console.warn('Email login notice:', error?.code);
    let msg = 'Credenciales inválidas.';
    if (error?.code === 'auth/user-not-found' || error?.code === 'auth/wrong-password' || error?.code === 'auth/invalid-credential') {
      msg = 'Correo o contraseña incorrectos.';
    }
    return { success: false, message: msg, code: error?.code };
  }
}

export async function logoutFirebaseAuth() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    console.warn('Sign-out notice:', error?.message);
    return { success: false, message: error?.message };
  }
}

export async function sendFirebasePasswordReset(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: `Se ha enviado un enlace de restablecimiento a ${email}.` };
  } catch (error: any) {
    if (error?.code === 'auth/operation-not-allowed') {
      return { success: false, code: error.code, message: 'Operación no habilitada en Firebase Console.' };
    }
    let msg = 'No se pudo enviar el correo de recuperación.';
    if (error?.code === 'auth/user-not-found') {
      msg = 'No existe ningún usuario registrado con ese correo.';
    }
    return { success: false, message: msg, code: error?.code };
  }
}
