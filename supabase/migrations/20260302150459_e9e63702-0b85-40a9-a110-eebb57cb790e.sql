
-- Create a function to check if a listing contains restricted bird species
CREATE OR REPLACE FUNCTION public.check_restricted_species()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  combined_text TEXT;
  restricted_species TEXT[] := ARRAY[
    'saker falcon', 'peregrine falcon', 'red-naped shaheen', 'laggar falcon', 'eurasian hobby',
    'alexandrine parakeet', 'rose-ringed parakeet', 'blossom-headed parakeet', 'slaty-headed parakeet',
    'houbara bustard', 'macqueen''s bustard', 'great indian bustard',
    'sarus crane', 'demoiselle crane', 'common crane',
    'western tragopan', 'cheer pheasant', 'monal pheasant',
    'greater flamingo', 'indian skimmer', 'sociable lapwing',
    'steppe eagle', 'greater-spotted eagle', 'imperial eagle', 'pallas''s fishing eagle',
    'white-rumped vulture', 'indian vulture', 'egyptian vulture', 'king vulture',
    'pallid scops owl', 'indian eagle-owl', 'short-eared owl'
  ];
  species_name TEXT;
BEGIN
  combined_text := LOWER(COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.species, '') || ' ' || COALESCE(NEW.description, ''));
  
  FOREACH species_name IN ARRAY restricted_species LOOP
    IF combined_text LIKE '%' || species_name || '%' THEN
      RAISE EXCEPTION 'Listing restricted: % is a protected species and cannot be sold.', species_name;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Attach trigger to listings table
CREATE TRIGGER check_restricted_species_trigger
BEFORE INSERT OR UPDATE ON public.listings
FOR EACH ROW
EXECUTE FUNCTION public.check_restricted_species();
