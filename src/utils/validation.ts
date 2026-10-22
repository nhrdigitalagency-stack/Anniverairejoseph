export interface ValidationErrors {
  [key: string]: string | undefined;
}

export function validateRSVPInput(input: {
  prenom: string;
  presence: string;
  accompagnants: number;
  maxCompanions: number;
}): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!input.prenom || input.prenom.trim().length === 0) {
    errors.prenom = "Veuillez renseigner votre prénom pour préparer votre réponse.";
  } else if (input.prenom.trim().length > 80) {
    errors.prenom = "Le prénom ne doit pas dépasser 80 caractères.";
  }

  if (!["Oui", "Non", "Peut-être"].includes(input.presence)) {
    errors.presence = "Veuillez indiquer votre présence (Oui, Non ou Peut-être).";
  }

  if (
    Number.isNaN(input.accompagnants) ||
    !Number.isInteger(input.accompagnants) ||
    input.accompagnants < 0 ||
    input.accompagnants > input.maxCompanions
  ) {
    errors.accompagnants = `Le nombre d’accompagnants doit être compris entre 0 et ${input.maxCompanions}.`;
  }

  return errors;
}

export function validateBirthdayWishInput(input: {
  prenom: string;
  message: string;
}): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!input.prenom || input.prenom.trim().length === 0) {
    errors.prenom = "Veuillez indiquer votre prénom.";
  }

  if (!input.message || input.message.trim().length === 0) {
    errors.message = "Veuillez écrire un petit mot pour Joseph.";
  } else if (input.message.length > 1000) {
    errors.message = "Votre message ne peut pas dépasser 1 000 caractères.";
  }

  return errors;
}

export function validateGiftInput(input: {
  prenom: string;
  objet: string;
  message: string;
}): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!input.prenom || input.prenom.trim().length === 0) {
    errors.prenom = "Veuillez indiquer votre prénom.";
  }

  if (!["Cadeau", "Surprise", "Autre question"].includes(input.objet)) {
    errors.objet = "Veuillez choisir un objet pour votre message.";
  }

  if (!input.message || input.message.trim().length === 0) {
    errors.message = "Veuillez préciser votre idée ou votre question.";
  }

  return errors;
}
